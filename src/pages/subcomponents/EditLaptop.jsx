import { useContext, useEffect, useState } from "react"
import SubLoading from "../../components/SubLoading"
import axios from "axios"
import { GlobalContext } from "../../context/Context"
import { useNavigate } from "react-router-dom"
import { storage } from "../../utils/firebase"
import { ref, getDownloadURL, uploadBytesResumable, deleteObject } from "firebase/storage"

const EditLaptop = ({ id, fetchLaptops, setEdit, setAlert }) => {
    const { baseUrl, setIsAlert } = useContext(GlobalContext)
    const [isLoading, setIsLoading] = useState(true)
    const accessToken = localStorage.getItem("accessToken")
    const [inputs, setInputs] = useState([])
    const [kategori, setKategori] = useState([])
    const navigate = useNavigate()
    const [error, setError] = useState({
        isError: false,
        message: ""
    })
    const [photo, setPhoto] = useState({
        oldName: "",
        oldUrl: "",
        name: "",
        url: ""
    })

    useEffect(() => {
        const fetchData = async () => {
            const dataKategori = await fetchLaptop()
            await fetchKategori(dataKategori)
            setIsLoading(false)
        }

        fetchData()
    }, [])

    const fetchLaptop = async () => {
        let result = []

        await axios.get(`${baseUrl}/api/laptops/${id}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
            .then(res => {
                const data = res.data.data

                setInputs([
                    { label: "Brand", type: "text", value: data.brand },
                    { label: "Model", type: "text", value: data.model },
                    { label: "Processor", type: "text", value: data.processor },
                    { label: "Ram", type: "text", value: data.ram },
                    { label: "Storage", type: "text", value: data.storage },
                    { label: "Gpu", type: "text", value: data.gpu },
                    { label: "Display", type: "text", value: data.display },
                    { label: "Resolution", type: "text", value: data.resolution },
                    { label: "Battery Capacity", type: "text", value: data.batteryCapacity },
                    { label: "Os", type: "text", value: data.os }
                ])

                const imageRef = ref(storage, data.photo)
                getDownloadURL(imageRef)
                    .then(url => {
                        setPhoto({
                            oldName: data.photo,
                            oldUrl: url,
                            name: data.photo,
                            url
                        })
                    })
                    .catch(() => {
                        setPhoto({
                            oldname: data.photo,
                            name: "laptop.jpg",
                            url: `/img/laptop.jpg`
                        })
                    })

                result = data.kategori
            })
            .catch(() => {
                setIsAlert(true)
                setAlert({
                    action: "Find Laptop",
                    status: "Failed"
                })
                setEdit(false)
            })

        return result
    }

    const fetchKategori = async (dataKategori) => {
        await axios.get(`${baseUrl}/api/kategori/`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
            .then(res => {
                const data = res.data.data
                const newData = data.map((k) => {
                    const isChecked = dataKategori.some(dk => dk.id === k.id)
                    return { ...k, isChecked }
                })

                setKategori(newData)
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
                setEdit(false)
            })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setIsLoading(true)

        const file = e.target[14].files[0];
        if (file) {
            const random = Math.random().toString().substring(2, 10);
            const newFileName = `${random}-${file.name}`;

            const newFile = new File([file], newFileName, {
                type: file.type,
                lastModified: file.lastModified
            });

            const imageRef = ref(storage, newFile.name)
            const upload = uploadBytesResumable(imageRef, newFile)

            upload.on("state_changed",
                null,
                (error) => {
                    setIsLoading(false)
                    console.log(error)
                    return
                },
                () => {
                    updateUser(newFile.name)
                }
            )
        } else {
            updateUser()
        }
    }

    const updateUser = (fileName) => {
        const kategoriInput = kategori.filter((item) => {
            if (item.isChecked) {
                return item
            }
        }).map((item) => (item.id))

        let payload = {
            brand: inputs[0].value,
            model: inputs[1].value,
            processor: inputs[2].value,
            ram: inputs[3].value,
            storage: inputs[4].value,
            gpu: inputs[5].value,
            display: inputs[6].value,
            resolution: inputs[7].value,
            batteryCapacity: inputs[8].value,
            os: inputs[9].value,
            kategori: kategoriInput
        }

        if (fileName) {
            payload.photo = fileName
        }

        axios.patch(`${baseUrl}/api/laptops/${id}`, payload,
            {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            }
        )
            .then(async () => {
                if (payload.photo) {
                    const oldImageRef = ref(storage, photo.oldName)
                    await deleteObject(oldImageRef)
                }

                setIsLoading(false)
                setEdit(false)
                fetchLaptops(() => {
                    setIsAlert(true)
                    setAlert({
                        action: "Update",
                        status: "Success"
                    })
                })
            })
            .catch(async (res) => {
                console.log(res)
                if (payload.photo) {
                    setPhoto(prev => ({ ...prev, url: prev.oldUrl, name: prev.oldName }))
                    const newImageRef = ref(storage, payload.photo)
                    await deleteObject(newImageRef)
                }

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
    }

    return (
        <div className="flex justify-center items-center h-screen fixed inset-0 bg-black bg-opacity-60 z-[60]">
            <div className="bg-white p-10 max-h-[550px] max-w-[700px] overflow-auto rounded-md shadow-md">
                {
                    isLoading ?
                        <SubLoading />
                        :
                        <form onSubmit={(e) => { handleSubmit(e) }}>
                            <p className="pb-3 border-b text-lg font-semibold">Edit Laptop</p>
                            <div className="grid grid-cols-3 gap-5 py-3 border-b">
                                {
                                    inputs.map((item, index) => (
                                        <div key={index} className="flex flex-col">
                                            <label>{item.label}</label>
                                            <input onChange={(e) => {
                                                setInputs(prev => {
                                                    const newInputs = [...prev]
                                                    newInputs[index].value = e.target.value
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
                                        kategori.map((item, index) => (
                                            <div key={index} className="flex gap-1 items-center">
                                                <input onChange={() => {
                                                    setKategori(prev => {
                                                        const newData = prev.map((k, i) => {
                                                            if (i === index) {
                                                                return { ...k, isChecked: !k.isChecked };
                                                            }
                                                            return { ...k };
                                                        })
                                                        return newData
                                                    })
                                                }} id={index} type="checkbox" value={item.id} checked={item.isChecked} />
                                                <label htmlFor={index}>{item.name}</label>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                            <div className="mt-5 pb-3 border-b">
                                <label htmlFor="photo" className="text-sm py-2 px-3 bg-gray-400 hover:bg-gray-500 duration-200 cursor-pointer shadow-md text-white rounded-sm">Select Photo</label>
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
                                            setPhoto(prev => ({ ...prev, url: ev.target.result, name: file.name }))
                                        }
                                        reader.readAsDataURL(file)
                                    }
                                }} id="photo" type="file" accept="image/*" hidden />
                                <div className="flex mt-4 gap-3">
                                    <div className="w-[100px] h-[100px]">
                                        <img src={photo.url} alt="laptop" />
                                    </div>
                                    <p className="w-[400px] overflow-auto">{photo.name}</p>
                                </div>
                            </div>
                            {error.isError && <p className="text-red-600 text-end mt-1">*Error: {error.message}</p>}
                            <div className="flex gap-3 justify-end items-center pt-3">
                                <button type="button" onClick={() => { setEdit(prev => ({ ...prev, isEdit: false })) }} className="bg-red-500 hover:bg-red-600 duration-150 py-2 px-5 text-white rounded-md">Cancel</button>
                                <button type="submit" className="bg-blue-500 hover:bg-blue-600 duration-150 py-2 px-5 text-white rounded-md">Save</button>
                            </div>
                        </form>
                }
            </div>
        </div>
    )
}

export default EditLaptop