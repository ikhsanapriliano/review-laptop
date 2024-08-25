import { Outlet } from "react-router-dom"
import Footer from "../components/Footer"
import Header from "../components/Header"

const Layout = () => {
    return (
        <>
            <Header />
            <main className="min-h-screen container pt-[70px] m-auto">
                <Outlet />
            </main>
            <Footer />
        </>
    )
}

export default Layout