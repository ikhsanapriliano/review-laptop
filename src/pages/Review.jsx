import { Link, useParams } from "react-router-dom"
import { useContext, useEffect, useState } from "react"
import { GlobalContext } from "../context/Context"
import { getDownloadURL, ref } from "firebase/storage"
import { storage } from "../utils/firebase"
import axios from "axios"
import SubLoading from "../components/SubLoading"
import Modal from "../components/Modal"

const Review = () => {
    const { id } = useParams()
    const { user, baseUrl, setHistory } = useContext(GlobalContext)
    const [laptop, setLaptop] = useState({})
    const [reviews, setReviews] = useState({
        data: [],
        rating: 0
    })
    const [isLoading, setIsLoading] = useState(true)
    const [input, setInput] = useState({
        action: "add",
        rating: 0,
        comment: ""
    })
    const [error, setError] = useState({
        isError: false,
        message: ""
    })
    const accessToken = localStorage.getItem("accessToken")
    const [success, setSuccess] = useState({
        isSuccess: false,
        action: ""
    })

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([fetchLaptop(), fetchReviews()])
            setIsLoading(false)
        }

        try {
            fetchData()
        } catch (error) {
            setIsLoading(false)
            console.log(error)
        }
    }, [])

    const fetchLaptop = async () => {
        try {
            const res = await axios.get(`${baseUrl}/api/laptops/${id}`)
            const data = res.data.data

            const imageRef = ref(storage, data.photo)
            const imageUrl = await getDownloadURL(imageRef)

            data.photo = imageUrl
            setLaptop(data)
        } catch (error) {
            throw new Error(error.message)
        }
    }

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`${baseUrl}/api/komentar/${id}`)

            if (res.data.data !== null) {
                let totalRating = 0
                res.data.data.forEach(review => {
                    totalRating += review.rating

                    if (review.username === user.username) {
                        setInput({
                            action: "edit",
                            rating: review.rating,
                            comment: review.comment
                        })
                    }
                })

                const result = Math.floor(totalRating / res.data.data.length)
                setReviews({ data: res.data.data, rating: result })
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }

    const generateRating = (ratingInput, isInput) => {
        const stars = []

        let counter = 0
        counter += ratingInput
        for (let i = 0; i < 5; i++) {
            if (counter > 0) {
                stars.push(<i key={i} onClick={() => {
                    if (isInput) {
                        setInput(prev => ({ ...prev, rating: i + 1 }))
                    }
                }} className={`fa-solid fa-star text-yellow-400 ${isInput && "cursor-pointer"}`}></i>)
                counter--
            } else {
                stars.push(<i key={i} onClick={() => {
                    if (isInput) {
                        setInput(prev => ({ ...prev, rating: i + 1 }))
                    }
                }} className={`fa-solid fa-star text-gray-300 ${isInput && "cursor-pointer"}`}></i>)
            }
        }

        return stars
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError({ isError: false, message: "" })
        setIsLoading(true)

        try {
            if (input.rating === 0) {
                throw new Error("rating is required")
            }

            if (input.action === "add") {
                await axios.post(`${baseUrl}/api/komentar/`, {
                    rating: input.rating,
                    comment: input.comment,
                    laptopId: Number(id)
                }, {
                    headers: {
                        "Authorization": `Bearer ${accessToken}`
                    }
                })

                setSuccess({
                    isSuccess: true,
                    action: "Add Review"
                })
            } else if (input.action === "edit") {
                await axios.patch(`${baseUrl}/api/komentar/`, {
                    rating: input.rating,
                    comment: input.comment,
                    laptopId: Number(id)
                }, {
                    headers: {
                        "Authorization": `Bearer ${accessToken}`
                    }
                })

                setSuccess({
                    isSuccess: true,
                    action: "Edit Review"
                })
            }

            setIsLoading(false)
        } catch (res) {
            if (res.response) {
                if (res.response.status === 401 || res.response.status === 403) {
                    localStorage.clear()
                    window.location.href = "/login"
                }

                setError({ isError: true, message: res.response.data.meta.message })
            } else {
                setError({ isError: true, message: res.message })
            }

            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        setError({ isError: false, message: "" })
        setIsLoading(true)

        try {
            await axios.delete(`${baseUrl}/api/komentar/${id}`, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            })

            setIsLoading(false)
            setSuccess({
                isSuccess: true,
                action: "Delete Review"
            })
        } catch (res) {
            if (res.response) {
                if (res.response.status === 401 || res.response.status === 403) {
                    localStorage.clear()
                    window.location.href = "/login"
                }

                setError({ isError: true, message: res.response.data.meta.message })
            } else {
                setError({ isError: true, message: res.message })
            }

            setIsLoading(false)
        }
    }

    return (
        <>
            {/* popup */}
            {success.isSuccess && <Modal action={success.action} status={"Success"} redirect={0} />}

            {/* main */}
            <section className="p-10 flex flex-col gap-10">
                {
                    isLoading ?
                        <SubLoading />
                        :
                        <>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-700">{laptop.brand} {laptop.model}</h1>
                                <nav className="flex gap-2">
                                    <Link className="underline text-blue-500" to={"/reviews"}>Reviews</Link>
                                    <p>{">"}</p>
                                    <Link className="underline text-blue-500" to={"/review/45"}>{laptop.brand} {laptop.model}</Link>
                                </nav>
                            </div>
                            <div className="flex flex-col xl:flex-row justify-center items-center xl:items-start gap-5">
                                <div className="w-[50%] max-h-[400px] overflow-hidden">
                                    <img src={laptop.photo} alt="laptop" />
                                </div>
                                <div className="xl:w-[50%] w-full">
                                    <h2 className="text-3xl font-bold text-gray-700">{laptop.brand} {laptop.model}</h2>
                                    <div className="flex gap-2 items-center mt-1">
                                        <div className="flex gap-1">
                                            {generateRating(reviews.rating)}
                                        </div>
                                        <p className="font-semibold">{reviews.rating} ({reviews.data.length})</p>
                                    </div>
                                    <p className="text-2xl font-semibold mt-5 mb-2">Specifications:</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="pb-2 border-b">
                                            <p className="text-lg font-semibold">Processor</p>
                                            <p>{laptop.processor}</p>
                                        </div>
                                        <div className="pb-2 border-b">
                                            <p className="text-lg font-semibold">Ram</p>
                                            <p>{laptop.ram}</p>
                                        </div>
                                        <div className="pb-2 border-b">
                                            <p className="text-lg font-semibold">Storage</p>
                                            <p>{laptop.storage}</p>
                                        </div>
                                        <div className="pb-2 border-b">
                                            <p className="text-lg font-semibold">Gpu</p>
                                            <p>{laptop.gpu}</p>
                                        </div>
                                        <div className="pb-2 border-b">
                                            <p className="text-lg font-semibold">Display</p>
                                            <p>sadasd</p>
                                        </div>
                                        <div className="pb-2 border-b">
                                            <p className="text-lg font-semibold">Resolution</p>
                                            <p>{laptop.resolution}</p>
                                        </div>
                                        <div className="pb-2 border-b">
                                            <p className="text-lg font-semibold">Battery Capacity</p>
                                            <p>{laptop.batteryCapacity}</p>
                                        </div>
                                        <div className="pb-2 border-b">
                                            <p className="text-lg font-semibold">Os</p>
                                            <p>{laptop.os}</p>
                                        </div>
                                        <div className="pb-2 border-b">
                                            <p className="text-lg font-semibold">Category</p>
                                            <p>
                                                {
                                                    laptop.kategori.map((item, index) => (
                                                        <span key={index}>{index !== 0 && ", "} {item.name}</span>
                                                    ))
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold pb-3 border-b">Reviews</h2>
                                <div>
                                    {
                                        user.isLoggedIn ?
                                            <form onSubmit={(e) => { handleSubmit(e) }} className="p-5 bg-white rounded-md border shadow-sm my-5">
                                                <div className="flex gap-5 items-center">
                                                    <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
                                                        <img src={`/img/${user.photo}`} alt="photo" />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-semibold mb-1">@{user.username} (me)</p>
                                                        <div className="flex gap-2 items-center">
                                                            <div className="flex gap-1">
                                                                {
                                                                    generateRating(input.rating, true)
                                                                }
                                                            </div>
                                                            <p className="font-semibold">{input.rating}.0</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <textarea onChange={(e) => { setInput(prev => ({ ...prev, comment: e.target.value })) }} placeholder="Type here...." value={input.comment} className="mt-5 p-5 border w-full max-h-[300px] resize-none" rows={5}></textarea>
                                                <div className="flex flex-col w-ful items-end">
                                                    {error.isError && <p className="text-red-600 mb-1">*Error: {error.message}</p>}
                                                    <div className="flex items-center gap-2">
                                                        {input.action === "edit" && <button type="button" onClick={() => { handleDelete() }} className="bg-red-600 hover:bg-red-700 duration-150 p-2 px-4 rounded-md text-white"><i className="fa-solid fa-trash"></i></button>}
                                                        <button type="submit" className="bg-gray-700 hover:bg-gray-800 duration-150 py-2 px-6 rounded-md text-white">Submit</button>
                                                    </div>
                                                </div>
                                            </form>
                                            :
                                            <Link onClick={() => { setHistory(`/review/${id}`) }} to={"/login"} >
                                                <button className="py-4 bg-gray-500 hover:bg-gray-600 duration-150 text-white w-full rounded-sm my-5">Please Login to Add a Review</button>
                                            </Link>
                                    }
                                    <div>
                                        {
                                            reviews.data.length === 0 ?
                                                <p className="text-center">No reviews found.</p>
                                                :
                                                reviews.data.map((review, index) => (
                                                    <div key={index} className="p-5 bg-white rounded-md border shadow-sm mb-5">
                                                        <div className="flex gap-5 items-center">
                                                            <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
                                                                <img src={`/img/${review.photo}`} alt="photo" />
                                                            </div>
                                                            <div>
                                                                <p className="text-lg font-semibold mb-1">@{review.username} {review.username === user.username && " (me)"}</p>
                                                                <div className="flex gap-2 items-center">
                                                                    <div className="flex gap-1">
                                                                        {
                                                                            generateRating(review.rating)
                                                                        }
                                                                    </div>
                                                                    <p className="font-semibold">{review.rating}.0</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="mt-5 p-5 border w-full max-h-[300px]">{review.comment}</p>
                                                    </div>
                                                ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </>
                }
            </section>
        </>
    )
}

export default Review