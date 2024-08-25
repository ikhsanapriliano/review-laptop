import { useContext, useEffect } from "react"
import { GlobalContext } from "../context/Context"
import { Outlet } from "react-router-dom"
import axios from "axios"
import Loading from "../components/Loading"

const ValidateToken = () => {
    const { baseUrl, user, setUser } = useContext(GlobalContext)
    const accessToken = localStorage.getItem("accessToken")

    useEffect(() => {
        if (accessToken !== null) {
            axios.get(`${baseUrl}/api/auth/validate-token/my-token`, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            })
                .then(res => {
                    const data = res.data.data
                    setUser({
                        userId: data.UserId,
                        username: data.Username,
                        role: data.Role,
                        photo: data.Photo,
                        isLoggedIn: true
                    })
                })
                .catch(() => {
                    localStorage.clear()
                    window.location.href = "/login"
                })
        }
    }, [accessToken])

    return (
        <>
            {
                accessToken !== null ?
                    <>
                        {
                            user.isLoggedIn ?
                                <Outlet />
                                :
                                <Loading />
                        }
                    </>
                    :
                    <Outlet />
            }
        </>
    )
}

export default ValidateToken