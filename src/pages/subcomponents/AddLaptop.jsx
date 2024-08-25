import { useContext, useEffect, useState } from "react"
import SubLoading from "../../components/SubLoading"
import axios from "axios"
import { GlobalContext } from "../../context/Context"
import { useNavigate } from "react-router-dom"
import { deleteObject, ref, uploadBytesResumable } from "firebase/storage"
import { storage } from "../../utils/firebase"

const AddLaptop = ({ fetchLaptops, setIsAdd, setAlert }) => {
    const { baseUrl, setIsAlert } = useContext(GlobalContext)
    const [isLoading, setIsLoading] = useState(true)
    const accessToken = localStorage.getItem("accessToken")
    const [inputs, setInputs] = useState([
        [
            { label: "Brand", type: "text", value: "My Brand" },
            { label: "Model", type: "text", value: "" },
            { label: "Processor", type: "text", value: "" },
            { label: "Ram", type: "text", value: "" },
            { label: "Storage", type: "text", value: "" },
            { label: "Gpu", type: "text", value: "" },
            { label: "Display", type: "text", value: "" },
            { label: "Resolution", type: "text", value: "" },
            { label: "Battery Capacity", type: "text", value: "" },
            { label: "Os", type: "text", value: "" }
        ]
    ])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [kategori, setKategori] = useState([])
    const [kategoriInputs, setKategoriInputs] = useState([])
    const navigate = useNavigate()
    const [error, setError] = useState({
        isError: false,
        message: ""
    })
    const [photos, setPhotos] = useState([
        {
            file: null,
            name: "please select a photo....",
            url: `/img/laptop.jpg`
        }
    ])

    useEffect(() => {
        const fetchData = async () => {
            await fetchKategori()
            setIsLoading(false)
        }

        fetchData()
    }, [])

    const fetchKategori = async () => {
        await axios.get(`${baseUrl}/api/kategori/`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
            .then(res => {
                const data = res.data.data
                const newData = data.map(item => ({
                    ...item,
                    isChecked: false
                }))
                setKategori(newData)
                setKategoriInputs([newData.map(item => ({ ...item }))])
            })
            .catch(res => {
                if (res.response.status === 401 || res.response.status === 403) {
                    localStorage.clear()
                    navigate("/login")
                }

                setIsAlert(true)
                setAlert({
                    action: "Find Kategori",
                    status: "Failed"
                })
                setIsAdd(false)
            })
    }

    const handleSubmit = async (e) => {
        try {
            e.preventDefault()
            setError({
                isError: false,
                message: ""
            })
            setIsLoading(true)

            const inputKategori = kategoriInputs.map((kat) => {
                return kat.filter((item) => {
                    if (item.isChecked) {
                        return item
                    }
                }).map((k) => (k.id))
            })

            photos.map(photo => {
                if (!photo.file) {
                    throw new Error("all fields requried")
                }
            })

            const promiseInputPhoto = photos.map(async (photo) => {
                const random = Math.random().toString().substring(2, 10);
                const newFileName = `${random}-${photo.file.name}`;

                const newFile = new File([photo.file], newFileName, {
                    type: photo.file.type,
                    lastModified: photo.file.lastModified
                });

                try {
                    const imageRef = ref(storage, newFile.name)
                    await uploadBytesResumable(imageRef, newFile)

                    return newFile.name
                } catch (error) {
                    throw new Error(error.message)
                }
            })

            const inputPhoto = await Promise.all(promiseInputPhoto)

            const payloads = inputs.map((input, index) => {
                const payload = {
                    brand: input[0].value,
                    model: input[1].value,
                    processor: input[2].value,
                    ram: input[3].value,
                    storage: input[4].value,
                    gpu: input[5].value,
                    display: input[6].value,
                    resolution: input[7].value,
                    batteryCapacity: input[8].value,
                    os: input[9].value,
                    photo: inputPhoto[index],
                    kategori: inputKategori[index]
                }

                return payload
            })

            axios.post(`${baseUrl}/api/laptops/`, payloads,
                {
                    headers: {
                        "Authorization": `Bearer ${accessToken}`
                    }
                }
            )
                .then(() => {
                    setIsLoading(false)
                    setIsAdd(false)
                    fetchLaptops(() => {
                        setIsAlert(true)
                        setAlert({
                            action: "Add Laptops",
                            status: "Success"
                        })
                    })
                })
                .catch((res) => {
                    payloads.forEach(async payload => {
                        const imageRef = ref(storage, payload.photo)
                        await deleteObject(imageRef)
                    })

                    if (res.response.status === 401 || res.response.status === 403) {
                        localStorage.clear()
                        navigate("/login")
                    }

                    setIsLoading(false)
                    setError({
                        isError: true,
                        message: res.response.data.meta.message
                    })
                })
        } catch (err) {
            setIsLoading(false)
            setError({
                isError: true,
                message: err.message
            })
        }
    }

    return (
        <div className="flex justify-center items-center h-screen fixed inset-0 bg-black bg-opacity-60 z-[60]">
            <div className="bg-white p-10 max-h-[550px] overflow-auto rounded-md shadow-md">
                {
                    isLoading ?
                        <SubLoading />
                        :
                        <>
                            <p className="text-lg font-semibold mb-2">Add Laptops</p>
                            <div className="flex gap-1 pb-4 border-b flex-wrap max-w-[600px]">
                                {
                                    inputs.map((input, index) => (
                                        <button onClick={() => { setCurrentIndex(index) }} key={index} className={`p-1 px-5 text-sm ${currentIndex === index ? `bg-gray-700 text-white border-none` : `bg-white`} rounded-sm border hover:bg-slate-300 duration-100`}>{input[0].value}</button>
                                    ))
                                }
                                <button onClick={() => {
                                    const newData = [...inputs, [
                                        { label: "Brand", type: "text", value: "My Brand" },
                                        { label: "Model", type: "text", value: "" },
                                        { label: "Processor", type: "text", value: "" },
                                        { label: "Ram", type: "text", value: "" },
                                        { label: "Storage", type: "text", value: "" },
                                        { label: "Gpu", type: "text", value: "" },
                                        { label: "Display", type: "text", value: "" },
                                        { label: "Resolution", type: "text", value: "" },
                                        { label: "Battery Capacity", type: "text", value: "" },
                                        { label: "Os", type: "text", value: "" }
                                    ]]
                                    setInputs(newData)
                                    setKategoriInputs(prev => ([...prev, kategori.map(item => ({ ...item }))]))
                                    setPhotos(prev => [...prev, { url: `/img/laptop.jpg`, name: "please select a photo....", file: null }])
                                    setCurrentIndex(newData.length - 1)
                                }} className="p-1 px-3 text-sm bg-white hover:bg-slate-300 duration-150 rounded-sm border">+</button>
                            </div>
                            <form onSubmit={(e) => { handleSubmit(e) }}>
                                <div className="grid grid-cols-3 gap-5 py-3 border-b">
                                    {
                                        inputs[currentIndex].map((item, index) => (
                                            <div key={index} className="flex flex-col">
                                                <label>{item.label}</label>
                                                <input required onChange={(e) => {
                                                    setInputs(prev => {
                                                        const newInputs = [...prev]
                                                        newInputs[currentIndex][index].value = e.target.value
                                                        return newInputs
                                                    })
                                                }} value={item.value} className="border px-1" type={item.type} />
                                            </div>
                                        ))
                                    }
                                </div>
                                <div className="flex flex-col gap-1 py-3 border-b">
                                    <p>Kategori</p>
                                    <div className="flex gap-5">
                                        {
                                            kategoriInputs[currentIndex].map((item, index) => (
                                                <div key={index} className="flex gap-1 items-center">
                                                    <input onChange={() => {
                                                        setKategoriInputs(prev => {
                                                            const newData = [...prev]
                                                            newData[currentIndex][index].isChecked = !newData[currentIndex][index].isChecked
                                                            return newData
                                                        })
                                                    }} id={index} type="checkbox" value={item.id} checked={item.isChecked} />
                                                    <label htmlFor={index}>{item.name}</label>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                                <div className="mt-5 pb-3 border-b relative">
                                    <input onChange={(e) => {
                                        const file = e.target.files[0]
                                        if (file) {
                                            if (!file.type.includes("image")) {
                                                setError({
                                                    isError: true,
                                                    message: "invalid image type"
                                                })
                                                return
                                            }

                                            const reader = new FileReader()
                                            reader.onload = (ev) => {
                                                setPhotos(prev => {
                                                    const newData = [...prev]
                                                    newData[currentIndex] = { url: ev.target.result, name: file.name, file }
                                                    return newData
                                                })
                                            }
                                            reader.readAsDataURL(file)
                                        }
                                    }} id="photo" name="photo" required type="file" accept="image/*" className="absolute left-0 opacity-0" />
                                    <label htmlFor="photo" className="text-sm py-2 px-3 absolute left-0 top-0 bg-gray-400 hover:bg-gray-500 duration-200 cursor-pointer shadow-md text-white rounded-sm">Select Photo</label>
                                    <div className="flex pt-[45px] gap-3">
                                        <div className="w-[100px] h-[100px]">
                                            <img src={photos[currentIndex].url} alt="laptop" />
                                        </div>
                                        <p className="w-[400px] overflow-auto">{photos[currentIndex].name}</p>
                                    </div>
                                </div>
                                {error.isError && <p className="text-red-600 text-end mt-1">*Error: {error.message}</p>}
                                <div className="flex gap-3 justify-end items-center pt-3">
                                    {inputs.length !== 1 && <button type="button" onClick={() => {
                                        setInputs(prev => ([...prev.slice(0, currentIndex), ...prev.slice(currentIndex + 1)]))
                                        setKategoriInputs(prev => ([...prev.slice(0, currentIndex), ...prev.slice(currentIndex + 1)]))
                                        setPhotos(prev => ([...prev.slice(0, currentIndex), ...prev.slice(currentIndex + 1)]))
                                        setCurrentIndex(0)
                                    }} className="bg-red-500 hover:bg-red-600 duration-150 py-2 px-5 text-white rounded-md"><i className="fa-solid fa-trash"></i></button>}
                                    <button type="button" onClick={() => { setIsAdd(false) }} className="bg-red-500 hover:bg-red-600 duration-150 py-2 px-5 text-white rounded-md">Cancel</button>
                                    <button type="submit" className="bg-blue-500 hover:bg-blue-600 duration-150 py-2 px-5 text-white rounded-md">Save</button>
                                </div>
                            </form>
                        </>
                }
            </div>
        </div>
    )
}

export default AddLaptop