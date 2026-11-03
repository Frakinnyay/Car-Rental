import React from 'react'
import { useAppContext } from '../context/useAppContext'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../utils/errors'

const Login = () => {
    const { setShowLogin, axios, setToken } = useAppContext()
    const [state, setState] = React.useState("login")
    const [name, setName] = React.useState("")
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [loading, setLoading] = React.useState(false)

    const onsubmitHandler = async (event) => {
        event.preventDefault()
        if (loading) return
        setLoading(true)
        try {
            const payload = state === "register" ? { name, email, password } : { email, password }
            const { data } = await axios.post(`/api/user/${state}`, payload)
            if (data.success) {
                setToken(data.token) // saves to localStorage + sets the Authorization header
                setShowLogin(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }
  return (
    <div onClick={()=>setShowLogin(false)} className='fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center text-sm text-gray-500 bg-black/50'>
        <form onSubmit={onsubmitHandler} onClick={(e)=>e.stopPropagation()} className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white">
            <p className="text-2xl font-medium m-auto">
                <span className="text-primary">User</span> {state === "login" ? "Login" : "Sign Up"}
            </p>
            {state === "register" && (
                <div className="w-full">
                    <p>Name</p>
                    <input onChange={(e) => setName(e.target.value)} value={name} placeholder="type here" autoComplete="name" maxLength={100} className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="text" required />
                </div>
            )}
            <div className="w-full ">
                <p>Email</p>
                <input onChange={(e) => setEmail(e.target.value)} value={email} placeholder="type here" autoComplete="email" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="email" required />
            </div>
            <div className="w-full ">
                <p>Password</p>
                <input onChange={(e) => setPassword(e.target.value)} value={password} placeholder="type here" autoComplete={state === "register" ? "new-password" : "current-password"} minLength={state === "register" ? 8 : undefined} maxLength={72} className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="password" required />
                {state === "register" && <p className="text-xs text-gray-400 mt-1">At least 8 characters</p>}
            </div>
            {state === "register" ? (
                <p>
                    Already have account? <span onClick={() => setState("login")} className="text-primary cursor-pointer">click here</span>
                </p>
            ) : (
                <p>
                    Create an account? <span onClick={() => setState("register")} className="text-primary cursor-pointer">click here</span>
                </p>
            )}
            <button disabled={loading} className="bg-primary hover:bg-blue-800 transition-all text-white w-full py-2 rounded-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? "Please wait..." : state === "register" ? "Create Account" : "Login"}
            </button>
        </form>
    </div>
  )
}

export default Login
