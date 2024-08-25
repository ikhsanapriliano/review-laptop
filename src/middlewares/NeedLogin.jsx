import { Outlet, useNavigate } from "react-router-dom"
import Loading from "../components/Loading"
import { useContext, useEffect } from "react"
import { GlobalContext } from "../context/Context"

const NeedLogin = () => {
    const { user } = useContext(GlobalContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (!user.isLoggedIn) {
            navigate("/login")
        }
    }, [])

    return (
        <>
            {
                user.isLoggedIn ?
                    <Outlet />
                    :
                    <Loading />
            }
        </>
    )
}

export default NeedLogin