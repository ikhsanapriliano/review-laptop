import { useContext, useEffect, useState } from "react"
import { GlobalContext } from "../context/Context"
import axios from "axios"
import SubLoading from "../components/SubLoading"
import { storage } from "../utils/firebase"
import { ref, getDownloadURL } from "firebase/storage"
import { useNavigate } from "react-router-dom"

const Reviews = () => {
    const { user, baseUrl, brand, isSearch, setIsSearch } = useContext(GlobalContext)
    const [laptops, setLaptops] = useState({ data: [], totalPage: [1] })
    const [currentPage, setCurrentPage] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [hovered, setHovered] = useState(-1)
    const [filter, setFilter] = useState({ review: 0, category: 0 })
    const [kategori, setKategori] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        setIsLoading(true)

        const fetchData = async () => {
            await Promise.all([fetchLaptops(), fetchKategori()])
            setIsSearch(false)
            setIsLoading(false)
        }

        fetchData()
    }, [isSearch])

    const fetchLaptops = async () => {
        try {
            const res = await axios.get(`${baseUrl}/api/laptops/?brand=${brand}&kategoriId=${filter.category}&userId=${filter.review}`)

            const data = res.data.data
            const totalPage = Math.ceil(data.length / 5)
            const pages = []
            for (let i = 1; i <= totalPage; i++) {
                pages.push(i)
            }

            const newDataPromise = data.map(async (item, index) => {
                const imageRef = ref(storage, item.photo)
                const photo = await getDownloadURL(imageRef)
                item.photo = photo

                return {
                    ...item,
                    index: index + 1,
                }
            })

            const newData = await Promise.all(newDataPromise)

            setLaptops({
                data: newData,
                totalPage: pages
            })
        } catch (res) {
            console.log(res)
        }
    }

    const fetchKategori = async () => {
        try {
            const res = await axios.get(`${baseUrl}/api/kategori/`)
            setKategori(res.data.data)
        } catch (res) {
            console.log(res)
        }
    }

    const handleApply = () => {
        setIsSearch(true)
    }

    return (
        <section className="p-10 flex flex-col justify-center items-center">
            {
                isLoading ?
                    <SubLoading />
                    :
                    <>
                        <div className="flex flex-col xl:flex-row gap-2 w-full justify-start flex-wrap">
                            <label>Filters :</label>
                            <select value={filter.review} onChange={(e) => { setFilter(prev => ({ ...prev, review: e.target.value })) }} className="pr-3">
                                <option value={0}>All Reviews</option>
                                {user.isLoggedIn && <option value={user.userId}>My Reviews</option>}
                            </select>
                            <select value={filter.category} onChange={(e) => { setFilter(prev => ({ ...prev, category: e.target.value })) }} className="pr-3">
                                <option value={0}>All Categories</option>
                                {
                                    kategori.map((item, index) => (
                                        <option key={index} value={item.id}>{item.name}</option>
                                    ))
                                }
                            </select>
                            <button onClick={() => { handleApply() }} className="bg-gray-200 py-1 px-4 rounded-md text-sm hover:bg-gray-300 duration-200">Apply</button>
                        </div>
                        {
                            laptops.data.length === 0 ?
                                <p className="mt-10">No laptops found.</p>
                                :
                                <div className="py-10 grid sm:grid-cols-1 xl:grid-cols-2 gap-5">
                                    {
                                        laptops.data.slice((currentPage * 4) - 4, currentPage * 4).map((laptop, index) => (
                                            <div onClick={() => { navigate(`/review/${laptop.id}`) }} onMouseEnter={() => { setHovered(index) }} onMouseLeave={() => { setHovered(-1) }} key={index} className="flex gap-5 bg-white cursor-pointer pb-5 border-b md:w-[500px]">
                                                <div className="w-[150px] h-[150px] overflow-hidden">
                                                    <img src={laptop.photo} alt="laptop" />
                                                </div>
                                                <div>
                                                    <p className={`text-xl font-semibold ${hovered === index ? 'text-orange-500' : "text-blue-700"}`}>{laptop.brand} {laptop.model}</p>
                                                    <ul className="list-disc list-inside">
                                                        <li>{laptop.processor}</li>
                                                        <li>{laptop.ram}</li>
                                                        <li>{laptop.gpu}</li>
                                                        <li>{laptop.display} ({laptop.resolution})</li>
                                                        <li>{laptop.storage}</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                        }
                        <div className="flex justify-center items-center w-full gap-2">
                            {
                                laptops.totalPage.map((page, index) => (
                                    <button onClick={() => { setCurrentPage(page) }} key={index} className={`${currentPage === page ? "bg-gray-800" : "bg-gray-500"} hover:bg-gray-600 duration-150 w-[30px] h-[30px] flex justify-center items-center rounded-sm text-white`}>
                                        {page}
                                    </button>
                                ))
                            }
                        </div>
                    </>
            }
        </section>
    )
}

export default Reviews