import { useContext, useEffect } from "react"
import { GlobalContext } from "../context/Context"
import { Outlet, useNavigate } from "react-router-dom"
import Loading from "../components/Loading"

const AdminOnly = () => {
    const { user } = useContext(GlobalContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (user.role !== "admin") {
            navigate("/")
        }
    }, [])

    return (
        <>
            {
                user.role === "admin" ?
                    <Outlet />
                    :
                    <Loading />
            }
        </>
    )
}

export default AdminOnly