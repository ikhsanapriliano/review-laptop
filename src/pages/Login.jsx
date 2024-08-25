import { useContext, useEffect, useState } from "react"
import axios from "axios"
import { GlobalContext } from "../context/Context"
import { Link, useNavigate } from "react-router-dom"
import Modal from "../components/Modal"
import SubLoading from "../components/SubLoading"

const Login = () => {
    const { baseUrl, user, history } = useContext(GlobalContext)
    const navigate = useNavigate()
    const [input, setInput] = useState({
        username: "",
        password: ""
    })
    const [error, setError] = useState({
        isError: false,
        message: ""
    })
    const [isSuccess, setIsSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (user.isLoggedIn) {
            navigate("/")
        }
    }, [])

    const handleLogin = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError({
            isError: false,
            message: ""
        })

        axios.post(`${baseUrl}/api/auth/login`, {
            username: input.username,
            password: input.password
        })
            .then(res => {
                setIsLoading(false)
                setIsSuccess(true)
                localStorage.setItem("accessToken", res.data.data.accessToken)
            })
            .catch(res => {
                setIsLoading(false)
                let message = res.response.data.meta.message
                setError({
                    isError: true,
                    message
                })
            })
    }

    return (
        <>
            {/* popup */}
            {isSuccess && <Modal action={"Login"} status={"Success"} redirect={history === "" ? "/reviews" : history} isLoggin={true} />}

            {/* main */}
            <section className="w-full flex flex-col justify-center items-center p-10">
                {
                    isLoading ?
                        <SubLoading />
                        :
                        <form onSubmit={(e) => { handleLogin(e) }} className="p-5 bg-white rounded-md shadow-sm border flex flex-col gap-5 w-[300px]">
                            <h1 className="text-center text-xl font-bold">Login</h1>
                            <div className="flex flex-col">
                                <label htmlFor="username">Username</label>
                                <input placeholder="admin ? admin : register" autoComplete="username" onChange={(e) => {
                                    setInput(prev => ({ ...prev, username: e.target.value }))
                                }} value={input.username} className="border px-1" id="username" type="text" required />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="password">Password</label>
                                <input placeholder="admin ? asdasdasd : register" autoComplete="off" onChange={(e) => {
                                    setInput(prev => ({ ...prev, password: e.target.value }))
                                }} value={input.password} className="border px-1" id="password" type="password" required />
                            </div>
                            {error.isError && <p className="text-red-600 text-sm">*{error.message}</p>}
                            <div>
                                <button className="bg-gray-300 py-1 w-full" type="submit">Login</button>
                                <p className="text-sm text-center mt-1">{`don't`} have account ?<Link to={"/register"} className="font-semibold underline">Register</Link></p>
                            </div>
                        </form>
                }
            </section>
        </>
    )
}

export default Login