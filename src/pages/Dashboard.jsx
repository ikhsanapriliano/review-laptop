import { useContext, useEffect, useState } from "react"
import { GlobalContext } from "../context/Context"
import axios from "axios"
import SubLoading from "../components/SubLoading"
import Alert from "../components/Alert"
import EditLaptop from "./subcomponents/EditLaptop"
import AddLaptop from "./subcomponents/AddLaptop"
import { deleteObject, ref } from "firebase/storage"
import { storage } from "../utils/firebase"

const Dashboard = () => {
    const { baseUrl, isAlert, setIsAlert } = useContext(GlobalContext)
    const [action, setAction] = useState("users")
    const accessToken = localStorage.getItem("accessToken")
    const [users, setUsers] = useState({
        data: [],
        totalPage: [1]
    })
    const [laptops, setLaptops] = useState({
        data: [],
        totalPage: [1]
    })
    const [currentPage, setCurrentPage] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [edit, setEdit] = useState({
        isEdit: false,
        id: 0
    })
    const [isAdd, setIsAdd] = useState(false)
    const [alert, setAlert] = useState({
        action: "",
        status: ""
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = (callback) => {
        setIsLoading(true)
        axios.get(`${baseUrl}/api/users/`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
            .then(res => {
                const data = res.data.data
                const totalPage = Math.ceil(data.length / 5)
                const pages = []
                for (let i = 1; i <= totalPage; i++) {
                    pages.push(i)
                }

                const newData = data.map((item, index) => ({
                    ...item,
                    index: index + 1
                }))

                setUsers({
                    data: newData,
                    totalPage: pages
                })

                setIsLoading(false)
                if (callback) {
                    callback()
                }
            })
            .catch(res => {
                if (res.response.status === 401 || res.response.status === 403) {
                    localStorage.clear()
                    window.location.href = "/login"
                }

                console.log(res.data)
                setIsLoading(false)
            })
    }

    const fetchLaptops = (callback) => {
        setIsLoading(true)

        axios.get(`${baseUrl}/api/laptops/`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
            .then(res => {
                const data = res.data.data
                const totalPage = Math.ceil(data.length / 5)
                const pages = []
                for (let i = 1; i <= totalPage; i++) {
                    pages.push(i)
                }

                const newData = data.map((item, index) => ({
                    ...item,
                    index: index + 1
                }))

                setLaptops({
                    data: newData,
                    totalPage: pages
                })

                setIsLoading(false)
                if (callback) {
                    callback()
                }
            })
            .catch(res => {
                if (res.response.status === 401 || res.response.status === 403) {
                    localStorage.clear()
                    window.location.href = "/login"
                }

                console.log(res.data)
                setIsLoading(false)
            })
    }

    const handleDelete = (id, photo) => {
        setIsLoading(true)

        axios.delete(`${baseUrl}/api/${action}/${id}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
            .then(async () => {
                if (action === "laptops") {
                    const imageRef = ref(storage, photo)
                    await deleteObject(imageRef)
                }

                if (action === "users") {
                    fetchUsers(() => { setIsAlert(true) })
                } else {
                    fetchLaptops(() => { setIsAlert(true) })
                }
                setAlert({
                    action: "Delete User",
                    status: "Success"
                })
            })
            .catch((res) => {
                if (res.response.status === 401 || res.response.status === 403) {
                    localStorage.clear()
                    window.location.href = "/login"
                }

                setAlert({
                    action: "Delete User",
                    status: "Failed"
                })
                setIsAlert(true)
                setIsLoading(false)
            })
    }

    return (
        <>
            {/* popup */}
            {isAlert && <Alert action={alert.action} status={alert.status} />}
            {isAdd && <AddLaptop id={edit.id} fetchLaptops={fetchLaptops} setIsAdd={setIsAdd} setAlert={setAlert} />}
            {edit.isEdit && <EditLaptop id={edit.id} fetchLaptops={fetchLaptops} setEdit={setEdit} setAlert={setAlert} />}

            {/* main */}
            <section className="p-10">
                <nav className="pb-5 flex items-center gap-5">
                    <button onClick={() => {
                        setAction("users")
                        if (users.data.length === 0) {
                            fetchUsers()
                        }
                        setCurrentPage(1)
                    }} className={`border py-2 px-4 rounded-md text-sm ${action === "users" && "bg-blue-400 text-white border-none font-semibold"}`}>User Management</button>
                    <button onClick={() => {
                        if (laptops.data.length === 0) {
                            fetchLaptops()
                        }
                        setAction("laptops")
                        setCurrentPage(1)
                    }} className={`border py-2 px-4 rounded-md text-sm ${action === "laptops" && "bg-blue-400 text-white border-none font-semibold"}`}>Laptop Management</button>
                </nav>
                {action === "laptops" && <button onClick={() => { setIsAdd(true) }} className="bg-green-600 hover:bg-green-700 duration-150 py-2 px-5 rounded-md text-white mb-2"><i className="fa-solid fa-plus pr-2"></i>Add Laptops</button>}
                {
                    isLoading ?
                        <SubLoading />
                        :
                        <div>
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-700 text-white">
                                        <th className="text-start p-5">No</th>
                                        <th className="text-start p-5">{action === "users" ? "Username" : "Brand"}</th>
                                        <th className="text-start p-5">{action === "users" ? "Role" : "Model"}</th>
                                        <th className="text-start p-5">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        action === "users" ?
                                            users.data.slice((currentPage * 5) - 5, currentPage * 5).map((item) => (
                                                <tr key={item.index} className="border-b">
                                                    <td className="px-5 py-3">{item.index}</td>
                                                    <td className="px-5 py-3">{item.username}</td>
                                                    <td className="px-5 py-3">{item.role}</td>
                                                    <td className="px-5 py-3"><button onClick={() => { handleDelete(item.id) }} className="bg-red-500 hover:bg-red-600 duration-150 text-white py-2 px-5 rounded-md">Delete</button></td>
                                                </tr>
                                            ))
                                            :
                                            laptops.data.slice((currentPage * 5) - 5, currentPage * 5).map((item) => (
                                                <tr key={item.index} className="border-b">
                                                    <td className="px-5 py-3">{item.index}</td>
                                                    <td className="px-5 py-3">{item.brand}</td>
                                                    <td className="px-5 py-3">{item.model}</td>
                                                    <td className="px-5 py-3 flex gap-3">
                                                        <button onClick={() => {
                                                            setEdit({
                                                                isEdit: true,
                                                                id: item.id
                                                            })
                                                        }} className="bg-yellow-500 hover:bg-yellow-600 duration-150 text-white py-2 px-5 rounded-md">Edit</button>
                                                        <button onClick={() => { handleDelete(item.id, item.photo) }} className="bg-red-500 hover:bg-red-600 duration-150 text-white py-2 px-5 rounded-md">Delete</button>
                                                    </td>
                                                </tr>
                                            ))
                                    }
                                </tbody>
                            </table>
                            {
                                action === "users" && users.data.length === 0 && <p className="text-center border-b py-5">No users found.</p>
                            }
                            {
                                action === "laptops" && laptops.data.length === 0 && <p className="text-center border-b py-5">No laptops found.</p>
                            }
                            {
                                action === "users" &&
                                <div className="flex justify-end gap-3 mt-5">
                                    {
                                        users.totalPage.map((item, index) => (
                                            <button type="button" onClick={() => { setCurrentPage(item) }} key={index} className={`w-8 h-8 text-white text-sm rounded-sm flex justify-center items-center ${currentPage === item ? "bg-slate-700" : "bg-slate-400"} hover:bg-slate-500 duration-150 cursor-pointer`}>{item}</button>
                                        ))
                                    }
                                </div>
                            }
                            {
                                action === "laptops" &&
                                <div className="flex justify-end gap-3 mt-5">
                                    {
                                        laptops.totalPage.map((item, index) => (
                                            <button type="button" onClick={() => { setCurrentPage(item) }} key={index} className={`w-8 h-8 text-white text-sm rounded-sm flex justify-center items-center ${currentPage === item ? "bg-slate-700" : "bg-slate-400"} hover:bg-slate-500 duration-150 cursor-pointer`}>{item}</button>
                                        ))
                                    }
                                </div>
                            }
                        </div>
                }
            </section>
        </>
    )
}

export default Dashboard