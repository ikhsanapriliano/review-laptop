import { useContext, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { GlobalContext } from "../context/Context"
import "../index.css"

const Header = () => {
    const { user, brand, setBrand, setIsSearch } = useContext(GlobalContext)
    const [isClicked, setIsClicked] = useState(false)
    const navigate = useNavigate()
    const [isNavOpen, setIsNavOpen] = useState(false)

    const handleLogout = () => {
        localStorage.clear()
        window.location.href = "/login"
    }

    const handleSearch = (e) => {
        e.preventDefault()

        if (window.location.href.includes("/reviews")) {
            setIsSearch(true)
        } else {
            navigate("/reviews")
        }
    }

    return (
        <>
            <header className="h-[70px] fixed inset-0 bg-white shadow-md flex justify-center items-center z-50">
                <nav className="container relative flex justify-center xl:justify-between items-center h-full">
                    <Link className="font-bold text-xl xl:flex hidden" to={"/"}>Review Laptop</Link>
                    <form onSubmit={(e) => { handleSearch(e) }} className="flex items-center">
                        <input value={brand} onChange={(e) => { setBrand(e.target.value) }} type="text" className="flex items-center border px-2 h-[35px] w-[100%] md:w-[400px] rounded-l-md focus:outline-none" placeholder="Search laptop brand" />
                        <button type="submit" className="bg-gray-700 hover:bg-gray-800 duration-150 flex justify-center items-center w-[30%] md:w-[100px] h-[35px] rounded-r-md"><i className="text-sm fa-solid fa-magnifying-glass text-white"></i></button>
                    </form>
                    <button onClick={() => { setIsNavOpen(prev => (!prev)) }}><i className="xl:hidden fa-solid fa-bars ml-5 text-2xl"></i></button>
                    {
                        !user.isLoggedIn ?
                            <div className="hidden xl:flex justify-center items-center h-full">
                                <Link className={`${window.location.pathname === "/" && "bg-gray-700 text-white font-semibold"} h-full flex items-center justify-center px-5`} to={"/"}>Home</Link>
                                <Link className={`${window.location.pathname === "/reviews" && "bg-gray-700 text-white font-semibold"} h-full flex items-center justify-center px-5`} to={"/reviews"}>Reviews</Link>
                                <Link className={`${window.location.pathname === "/register" && "bg-gray-700 text-white font-semibold"} h-full flex items-center justify-center px-5`} to={"/register"}>Register</Link>
                                <Link className={`${window.location.pathname === "/login" && "bg-gray-700 text-white font-semibold"} h-full flex items-center justify-center px-5`} to={"/login"}>Login</Link>
                            </div>
                            :
                            <div className="hidden xl:flex justify-center items-center h-full">
                                <Link className={`${window.location.pathname === "/" && "bg-gray-700 text-white font-semibold"} h-full flex items-center justify-center px-5`} to={"/"}>Home</Link>
                                <Link className={`${window.location.pathname === "/reviews" && "bg-gray-700 text-white font-semibold"} h-full flex items-center justify-center px-5`} to={"/reviews"}>Reviews</Link>
                                {user.role === "admin" && <Link className={`${window.location.pathname === "/dashboard" && "bg-gray-700 text-white font-semibold"} h-full flex items-center justify-center px-5`} to={"/dashboard"}>Dashboard</Link>}
                                <Link className={`${window.location.pathname === "/profile" && "bg-gray-700 text-white font-semibold"} h-full flex items-center justify-center px-5 mr-5`} to={"/profile"}>Profile</Link>
                                <div onClick={() => { setIsClicked(prev => !prev) }} className="w-10 h-10 rounded-full overflow-hidden cursor-pointer">
                                    <img src={`/img/${user.photo}`} alt="photo" />
                                </div>
                                {
                                    isClicked &&
                                    <div className="nav-modal bg-white absolute top-[80px] right-0 p-5 border shadow-md rounded-md">
                                        <div className="flex justify-start items-center gap-4 w-[200px] mb-2">
                                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                                <img src={`/img/${user.photo}`} alt="photo" />
                                            </div>
                                            <div>
                                                <p className="text-xl font-semibold">{user.username}</p>
                                                <p className="text-sm">{user.role}</p>
                                            </div>
                                        </div>
                                        <hr />
                                        <button onClick={() => {
                                            setIsClicked(false)
                                            navigate("/change-password")
                                        }} className="bg-yellow-400 w-full mt-2 py-1 rounded-md text-white hover:bg-yellow-500 duration-150">Change Password</button>
                                        <button onClick={() => { handleLogout() }} className="bg-red-600 w-full mt-1 py-1 text-white rounded-md hover:bg-red-700 duration-150">Logout</button>
                                    </div>
                                }
                            </div>
                    }
                </nav>
            </header>

            {/* mobile */}
            {
                isNavOpen &&
                <nav className="bg-white z-[60] fixed top-[70px] shadow-xl right-0 left-0 flex flex-col">
                    {
                        !user.isLoggedIn ?
                            <div className="xl:hidden flex flex-col justify-between items-center w-full">
                                <Link className={`${window.location.pathname === "/" && "bg-gray-700 text-white font-semibold"} w-full flex items-center justify-center py-5`} to={"/"}>Home</Link>
                                <Link className={`${window.location.pathname === "/reviews" && "bg-gray-700 text-white font-semibold"} w-full flex items-center justify-center py-5`} to={"/reviews"}>Reviews</Link>
                                <Link className={`${window.location.pathname === "/register" && "bg-gray-700 text-white font-semibold"} w-full flex items-center justify-center py-5`} to={"/register"}>Register</Link>
                                <Link className={`${window.location.pathname === "/login" && "bg-gray-700 text-white font-semibold"} w-full flex items-center justify-center py-5`} to={"/login"}>Login</Link>
                            </div>
                            :
                            <div className="xl:hidden flex flex-col justify-between items-center w-full">
                                <Link className={`${window.location.pathname === "/" && "bg-gray-700 text-white font-semibold"} w-full flex items-center justify-center py-5`} to={"/"}>Home</Link>
                                <Link className={`${window.location.pathname === "/reviews" && "bg-gray-700 text-white font-semibold"} w-full flex items-center justify-center py-5`} to={"/reviews"}>Reviews</Link>
                                {user.role === "admin" && <Link className={`${window.location.pathname === "/dashboard" && "bg-gray-700 text-white font-semibold"} w-full flex items-center justify-center py-5`} to={"/dashboard"}>Dashboard</Link>}
                                <Link className={`${window.location.pathname === "/profile" && "bg-gray-700 text-white font-semibold"} w-full flex items-center justify-center py-5`} to={"/profile"}>Profile</Link>
                            </div>
                    }
                    <button onClick={() => {
                        setIsClicked(false)
                        navigate("/change-password")
                    }} className="bg-yellow-400 w-full py-5 text-white hover:bg-yellow-500 duration-150">Change Password</button>
                    <button onClick={() => { handleLogout() }} className="bg-red-600 w-full py-5 text-white hover:bg-red-700 duration-150">Logout</button>
                </nav>
            }
        </>
    )
}

export default Header