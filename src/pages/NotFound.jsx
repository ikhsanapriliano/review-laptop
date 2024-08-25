import { Link } from "react-router-dom"

const NotFound = () => {
    return (
        <section className="flex flex-col h-[80vh] justify-center items-center">
            <h1 className="text-2xl font-bold">404 Not Found</h1>
            <Link className="font-semibold underline" to={"/"}>Home</Link>
        </section>
    )
}

export default NotFound