import { Link } from "react-router-dom"

const Home = () => {
    return (
        <>
            <section className="h-screen flex flex-col justify-center items-center pb-[100px] text-center px-5">
                <p className="xl:text-[5rem] text-[2rem] font-bold">Want to Buy a Laptop?</p>
                <p className="xl:text-2xl font-bold">Checkout The Reviews First! or Give Some Reviews</p>
                <p className="text-xl text-gray-600 font-semibold"></p>
                <Link to={"/reviews"} className="bg-gray-700 hover:bg-gray-800 duration-200 rounded-sm text-white py-1 px-3 mt-5">{`Don't`} Click Me</Link>
            </section>
            <section></section>
        </>
    )
}

export default Home