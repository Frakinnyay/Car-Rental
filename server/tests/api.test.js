/**
 * Integration tests: real Express app + real MongoDB (TEST_MONGODB_URI, default
 * mongodb://127.0.0.1:27017, throw-away database per run).
 * Only the ImageKit network upload is replaced by a stub.
 */
import { test, before, after, mock } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-test-secret-test-secret-123";
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || "mongodb://127.0.0.1:27017";
process.env.MONGODB_DB_NAME = `car-rental-test-${Date.now()}`;

mock.module(new URL("../utils/uploadImage.js", import.meta.url).href, {
  namedExports: { uploadImage: async (file, folder) => `https://ik.example.com${folder}/${file.originalname}` },
});

let server, base;
const iso = (offsetDays) => new Date(Date.now() + offsetDays * 86400000).toISOString().slice(0, 10);

async function call(method, path, { token, body, form, headers = {} } = {}) {
  const opts = { method, headers: { ...headers } };
  if (token) opts.headers.authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  if (form) opts.body = form;
  else if (body !== undefined) {
    opts.headers["content-type"] = "application/json";
    opts.body = typeof body === "string" ? body : JSON.stringify(body);
  }
  const res = await fetch(base + path, opts);
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON */ }
  return { status: res.status, body: json };
}

async function register(name, email, password = "password123") {
  const r = await call("POST", "/api/user/register", { body: { name, email, password } });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  return r.body.token;
}
const becomeOwner = async (token) => assert.equal((await call("POST", "/api/owner/change-role", { token })).status, 200);

const carPayload = (over = {}) => ({
  brand: "BMW", model: "X5", year: 2022, pricePerDay: 100, category: "SUV",
  transmission: "Automatic", fuel_type: "Hybrid", seating_capacity: 5, location: "Mumbai",
  description: "Test car", ...over,
});
function carForm(data, { type = "image/png", size = 64, name = "car.png", omitImage = false } = {}) {
  const f = new FormData();
  if (!omitImage) f.append("image", new Blob([new Uint8Array(size)], { type }), name);
  f.append("carData", typeof data === "string" ? data : JSON.stringify(data));
  return f;
}
async function addCar(ownerToken, over) {
  const r = await call("POST", "/api/owner/uploadcar", { token: ownerToken, form: carForm(carPayload(over)) });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  const cars = (await call("GET", "/api/owner/cars", { token: ownerToken })).body.cars;
  return cars.find((c) => (over?.model ? c.model === over.model : true)) ?? cars[0];
}

before(async () => {
  const { default: app } = await import("../app.js");
  await new Promise((resolve) => { server = app.listen(0, "127.0.0.1", resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((r) => server.close(r));
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

test("health endpoint and unknown route", async () => {
  assert.equal((await call("GET", "/health")).body.status, "ok");
  const r = await call("GET", "/api/nope");
  assert.equal(r.status, 404);
  assert.equal(r.body.success, false);
});

test("malformed JSON body returns 400 instead of crashing", async () => {
  const r = await call("POST", "/api/user/login", { body: "{bad json" });
  assert.equal(r.status, 400);
  assert.match(r.body.message, /JSON/i);
});

test("registration validation, hashing and duplicate handling", async () => {
  const bad = [
    [{ name: "A", email: "a@x.com" }, /required/i],
    [{ name: "A", email: "not-an-email", password: "password123" }, /valid email/i],
    [{ name: "A", email: "a@x.com", password: "short" }, /8 characters/i],
    [{ name: "A", email: { $ne: null }, password: "password123" }, /required/i],
    [{ name: "   ", email: "a@x.com", password: "password123" }, /valid name/i],
  ];
  for (const [body, re] of bad) {
    const r = await call("POST", "/api/user/register", { body });
    assert.equal(r.status, 400, JSON.stringify(body));
    assert.match(r.body.message, re);
  }
  const token = await register("Alice", "Alice@Example.com");
  assert.ok(token);
  const dup = await call("POST", "/api/user/register", { body: { name: "Al", email: "alice@example.com", password: "password123" } });
  assert.equal(dup.status, 409);
  const stored = await mongoose.connection.collection("users").findOne({ email: "alice@example.com" });
  assert.ok(stored, "email is stored lower-cased");
  assert.notEqual(stored.password, "password123");
  assert.match(stored.password, /^\$2[aby]\$/, "password is a bcrypt hash");
});

test("login: success, wrong password, unknown user, operator injection", async () => {
  await register("Bob", "bob@example.com");
  const ok = await call("POST", "/api/user/login", { body: { email: "BOB@example.com", password: "password123" } });
  assert.equal(ok.status, 200);
  assert.ok(ok.body.token);
  const wrong = await call("POST", "/api/user/login", { body: { email: "bob@example.com", password: "nope-nope" } });
  const unknown = await call("POST", "/api/user/login", { body: { email: "ghost@example.com", password: "password123" } });
  assert.equal(wrong.status, 401);
  assert.equal(unknown.status, 401);
  assert.equal(wrong.body.message, unknown.body.message, "no account enumeration");
  const inj = await call("POST", "/api/user/login", { body: { email: { $ne: null }, password: { $ne: null } } });
  assert.equal(inj.status, 400);
});

test("auth middleware rejects missing, forged, wrongly signed, expired and legacy tokens", async () => {
  const token = await register("Carl", "carl@example.com");
  const { id } = jwt.decode(token);
  assert.equal(typeof id, "string");

  assert.equal((await call("GET", "/api/user/data")).status, 401);
  assert.equal((await call("GET", "/api/user/data", { token: "garbage" })).status, 401);

  // unsigned token (alg:none) - this was accepted by the original code
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const none = `${b64({ alg: "none", typ: "JWT" })}.${b64({ id })}.`;
  assert.equal((await call("GET", "/api/user/data", { token: none })).status, 401);

  const wrongSecret = jwt.sign({ id }, "some-other-secret-some-other-secret");
  assert.equal((await call("GET", "/api/user/data", { token: wrongSecret })).status, 401);
  const expired = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: -10 });
  assert.equal((await call("GET", "/api/user/data", { token: expired })).status, 401);
  const legacy = jwt.sign(id, process.env.JWT_SECRET); // old format: bare string payload
  assert.equal((await call("GET", "/api/user/data", { token: legacy })).status, 401);
  const ghost = jwt.sign({ id: new mongoose.Types.ObjectId().toString() }, process.env.JWT_SECRET);
  assert.equal((await call("GET", "/api/user/data", { token: ghost })).status, 401);

  const good = await call("GET", "/api/user/data", { token });
  assert.equal(good.status, 200);
  assert.equal(good.body.user.email, "carl@example.com");
  assert.equal(good.body.user.password, undefined, "password hash never returned");
  // bare token (no "Bearer ") still works for backwards compatibility
  const bare = await call("GET", "/api/user/data", { headers: { authorization: token } });
  assert.equal(bare.status, 200);
});

test("role based access: plain users cannot use owner endpoints", async () => {
  const token = await register("Dan", "dan@example.com");
  for (const [m, p] of [["GET", "/api/owner/cars"], ["GET", "/api/owner/dashboard"], ["GET", "/api/booking/owner-booking"]]) {
    assert.equal((await call(m, p, { token })).status, 403, p);
  }
  assert.equal((await call("POST", "/api/owner/uploadcar", { form: carForm(carPayload()) })).status, 401, "anonymous upload rejected before parsing");
  assert.equal((await call("POST", "/api/owner/uploadcar", { token, form: carForm(carPayload()) })).status, 403);
  await becomeOwner(token);
  assert.equal((await call("GET", "/api/owner/cars", { token })).status, 200);
  assert.equal((await call("GET", "/api/user/data", { token })).body.user.role, "owner");
});

test("owner car CRUD: validation, whitelist, toggle, delete, ownership", async () => {
  const owner = await register("Olivia", "olivia@example.com");
  const other = await register("Oscar", "oscar@example.com");
  await becomeOwner(owner);
  await becomeOwner(other);

  const noImg = await call("POST", "/api/owner/uploadcar", { token: owner, form: carForm(carPayload(), { omitImage: true }) });
  assert.equal(noImg.status, 400);
  const pdf = await call("POST", "/api/owner/uploadcar", { token: owner, form: carForm(carPayload(), { type: "application/pdf", name: "x.pdf" }) });
  assert.equal(pdf.status, 400);
  const big = await call("POST", "/api/owner/uploadcar", { token: owner, form: carForm(carPayload(), { size: 5 * 1024 * 1024 }) });
  assert.equal(big.status, 400);
  assert.match(big.body.message, /too large/i);
  for (const over of [{ pricePerDay: -5 }, { year: "abc" }, { brand: "" }, { seating_capacity: 0 }]) {
    const r = await call("POST", "/api/owner/uploadcar", { token: owner, form: carForm(carPayload(over)) });
    assert.equal(r.status, 400, JSON.stringify(over));
  }
  assert.equal((await call("POST", "/api/owner/uploadcar", { token: owner, form: carForm("not json") })).status, 400);

  // mass-assignment attempt: client tries to set owner/image/isAvailable
  const evil = carPayload({ owner: new mongoose.Types.ObjectId().toString(), image: "http://evil/x.png", isAvailable: false });
  const created = await call("POST", "/api/owner/uploadcar", { token: owner, form: carForm(evil) });
  assert.equal(created.status, 201);
  const [car] = (await call("GET", "/api/owner/cars", { token: owner })).body.cars;
  assert.equal(car.isAvailable, true);
  assert.match(car.image, /^https:\/\/ik\.example\.com\/cars\//);
  const me = (await call("GET", "/api/user/data", { token: owner })).body.user;
  assert.equal(car.owner, me._id);

  const pub = (await call("GET", "/api/user/cars")).body.cars;
  assert.ok(pub.some((c) => c._id === car._id));

  assert.equal((await call("POST", "/api/owner/toggle-car", { token: other, body: { carId: car._id } })).status, 403);
  assert.equal((await call("POST", "/api/owner/toggle-car", { token: owner, body: { carId: new mongoose.Types.ObjectId().toString() } })).status, 404);
  assert.equal((await call("POST", "/api/owner/toggle-car", { token: owner, body: { carId: { $ne: 1 } } })).status, 400);

  assert.equal((await call("POST", "/api/owner/toggle-car", { token: owner, body: { carId: car._id } })).status, 200);
  assert.ok(!(await call("GET", "/api/user/cars")).body.cars.some((c) => c._id === car._id), "hidden when toggled off");
  await call("POST", "/api/owner/toggle-car", { token: owner, body: { carId: car._id } });
  assert.ok((await call("GET", "/api/user/cars")).body.cars.some((c) => c._id === car._id), "visible again");

  assert.equal((await call("POST", "/api/owner/delete-car", { token: other, body: { carId: car._id } })).status, 403);
  assert.equal((await call("POST", "/api/owner/delete-car", { token: owner, body: { carId: car._id } })).status, 200);
  assert.equal((await call("GET", "/api/owner/cars", { token: owner })).body.cars.length, 0);
  assert.ok(!(await call("GET", "/api/user/cars")).body.cars.some((c) => c._id === car._id));
});

test("profile image upload", async () => {
  const t = await register("Pia", "pia@example.com");
  const f = new FormData();
  f.append("image", new Blob([new Uint8Array(32)], { type: "image/png" }), "me.png");
  assert.equal((await call("POST", "/api/owner/update-image", { token: t, form: f })).status, 200);
  assert.match((await call("GET", "/api/user/data", { token: t })).body.user.image, /ik\.example\.com\/users\/me\.png/);
  assert.equal((await call("POST", "/api/owner/update-image", { token: t, form: new FormData() })).status, 400);
});

test("booking workflow: validation, pricing, overlap, status, dashboard", async () => {
  const owner = await register("Quinn", "quinn@example.com");
  const alice = await register("Rita", "rita@example.com");
  const ben = await register("Sam", "sam@example.com");
  await becomeOwner(owner);
  const car = await addCar(owner, { model: "Booked", pricePerDay: 100, location: "Delhi-Test" });
  const book = (token, pickupDate, returnDate, id = car._id) => call("POST", "/api/booking/create-booking", { token, body: { car: id, pickupDate, returnDate } });

  assert.equal((await call("POST", "/api/booking/create-booking", { body: { car: car._id, pickupDate: iso(5), returnDate: iso(6) } })).status, 401);
  // date validation
  assert.equal((await book(alice, iso(-5), iso(3))).status, 400, "past pickup");
  assert.equal((await book(alice, iso(5), iso(3))).status, 400, "return before pickup");
  assert.equal((await book(alice, "05/06/2030", "06/06/2030")).status, 400, "bad format");
  assert.equal((await book(alice, "2030-02-31", "2030-03-02")).status, 400, "impossible date");
  assert.equal((await book(alice, iso(5), iso(5 + 400))).status, 400, "too long");
  assert.equal((await book(alice, iso(5), iso(6), "123")).status, 400, "bad id");
  assert.equal((await book(alice, iso(5), iso(6), { $ne: 1 })).status, 400, "operator injection");
  assert.equal((await book(alice, iso(5), iso(6), new mongoose.Types.ObjectId().toString())).status, 404, "unknown car");

  // 3 nights = 300; same-day = 1 day
  assert.equal((await book(alice, iso(10), iso(13))).status, 201);
  const mine = (await call("GET", "/api/booking/user-booking", { token: alice })).body.booking;
  assert.equal(mine.length, 1);
  assert.equal(mine[0].price, 300);
  assert.equal(mine[0].status, "pending");
  assert.equal(mine[0].car.model, "Booked", "car is populated");
  assert.equal((await book(alice, iso(20), iso(20))).status, 201);
  assert.equal((await call("GET", "/api/booking/user-booking", { token: alice })).body.booking.find((b) => b.pickupDate.startsWith(iso(20))).price, 100);

  // overlapping ranges (inclusive boundaries) are rejected
  for (const [a, b] of [[10, 13], [11, 12], [8, 10], [13, 15], [5, 30], [20, 20]]) {
    assert.equal((await book(ben, iso(a), iso(b))).status, 409, `${a}-${b}`);
  }
  assert.equal((await book(ben, iso(14), iso(16))).status, 201, "adjacent free range works");

  // availability search
  const search = (d1, d2, location = "Delhi-Test") => call("POST", "/api/booking/check-availablity", { body: { location, pickupDate: iso(d1), returnDate: iso(d2) } });
  assert.equal((await search(11, 12)).body.availableCars.length, 0);
  assert.equal((await search(30, 32)).body.availableCars.length, 1);
  assert.equal((await search(30, 32, "Nowhere")).body.availableCars.length, 0);
  assert.equal((await call("POST", "/api/booking/check-availablity", { body: {} })).status, 400);
  assert.equal((await call("POST", "/api/booking/check-availablity", { body: { location: { $ne: 1 }, pickupDate: iso(1), returnDate: iso(2) } })).status, 400);

  // owner view: no password hash leaks, only own bookings
  const ownerBookings = await call("GET", "/api/booking/owner-booking", { token: owner });
  assert.equal(ownerBookings.status, 200);
  assert.equal(ownerBookings.body.success, true);
  assert.equal(ownerBookings.body.booking.length, 3);
  assert.equal(ownerBookings.body.booking[0].user.password, undefined);
  assert.ok(ownerBookings.body.booking[0].user.name);

  // status changes
  const target = ownerBookings.body.booking.find((b) => b.price === 300);
  const setStatus = (token, status, id = target._id) => call("POST", "/api/booking/booking-status", { token, body: { bookingId: id, status } });
  assert.equal((await setStatus(ben, "confirmed")).status, 403, "non-owner");
  assert.equal((await setStatus(alice, "confirmed")).status, 403, "customer cannot self-confirm");
  assert.equal((await setStatus(owner, "bogus")).status, 400);
  assert.equal((await setStatus(owner, "confirmed", new mongoose.Types.ObjectId().toString())).status, 404);
  assert.equal((await setStatus(owner, "confirmed")).status, 200);
  assert.equal((await call("GET", "/api/booking/user-booking", { token: alice })).body.booking.find((b) => b.price === 300).status, "confirmed");

  const dash = (await call("GET", "/api/owner/dashboard", { token: owner })).body.dashboardData;
  assert.equal(dash.totalCars, 1);
  assert.equal(dash.totalBookings, 3);
  assert.equal(dash.pendingBookings, 2);
  assert.equal(dash.completedBookings, 1);
  assert.equal(dash.monthlyRevenue, 300);
  assert.equal(dash.recentBookings.length, 3);

  // cancelling frees the dates and is terminal
  assert.equal((await setStatus(owner, "Cancelled")).status, 200);
  assert.equal((await setStatus(owner, "confirmed")).status, 409, "cancelled cannot be re-opened");
  assert.equal((await book(ben, iso(11), iso(12))).status, 201, "cancelled booking no longer blocks");
  assert.equal((await call("GET", "/api/owner/dashboard", { token: owner })).body.dashboardData.monthlyRevenue, 0);

  // unavailable / deleted cars cannot be booked
  await call("POST", "/api/owner/toggle-car", { token: owner, body: { carId: car._id } });
  assert.equal((await book(alice, iso(40), iso(41))).status, 409);
  await call("POST", "/api/owner/toggle-car", { token: owner, body: { carId: car._id } });
  assert.equal((await book(alice, iso(40), iso(41))).status, 201);
  await call("POST", "/api/owner/delete-car", { token: owner, body: { carId: car._id } });
  assert.equal((await book(alice, iso(50), iso(51))).status, 409);
  // history of a deleted car is still readable
  assert.equal((await call("GET", "/api/booking/user-booking", { token: alice })).body.booking[0].car.model, "Booked");
});

test("concurrent requests cannot double-book the same car", async () => {
  const owner = await register("Tess", "tess@example.com");
  await becomeOwner(owner);
  const car = await addCar(owner, { model: "Race", location: "RaceCity" });
  const users = await Promise.all(Array.from({ length: 8 }, (_, i) => register(`U${i}`, `race${i}@example.com`)));
  const results = await Promise.all(
    users.map((t) => call("POST", "/api/booking/create-booking", { token: t, body: { car: car._id, pickupDate: iso(60), returnDate: iso(63) } }))
  );
  const ok = results.filter((r) => r.status === 201).length;
  assert.equal(ok, 1, `expected exactly one winner, got statuses ${results.map((r) => r.status)}`);
  assert.equal(await mongoose.connection.collection("bookings").countDocuments({ car: new mongoose.Types.ObjectId(car._id) }), 1);
});
