import React, { useEffect, useRef, useState } from "react";
import axios from "./utils/axios";
import styled from "styled-components";
import Edit from "./Edit";
import socket from "./utils/socket";
import { Link } from "react-router-dom";

const SellerHotels = () => {
    const [hotels, setHotels] = useState([]);
    const [filteredHotels, setFilteredHotels] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [orders, setOrders] = useState(null);
    const [revenue, setRevenue] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [sort, setSort] = useState(null);
    const [approvalStatus, setApprovalStatus] = useState(null);
    
    const deleteRequest = async () => {

    }

    const popup = () => {
        setIsOpen((prev) => !prev);
    };

    const submitHandler = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const sort = formData.get("sort");
        const approvalStatus = formData.get("ApprovalStatus");
        const type = sort?.split("-")[0];
        const order = sort?.split("-")[1];
        setFilteredHotels(hotels);
        if (!sort && !approvalStatus) {
            setFilteredHotels(hotels);
        }

        if (type === "p") {
            if (order[0] == "l")
                setFilteredHotels((prev) =>
                    prev.sort((a, b) => a.price - b.price)
                );
            else
                setFilteredHotels((prev) =>
                    prev.sort((a, b) => b.price - a.price)
                );
        } else if (type == "r") {
            if (order[0] == "l")
                setFilteredHotels((prev) =>
                    prev.sort((a, b) => a.revenue - b.revenue)
                );
            else
                setFilteredHotels((prev) =>
                    prev.sort((a, b) => b.revenue - a.revenue)
                );
        }

        if (approvalStatus == "approved") {
            setFilteredHotels((prev) =>
                prev.filter(
                    (hotel) => hotel.approvalStatus === "approved"
                )
            );
        } else if (approvalStatus == "rejected") {
            setFilteredHotels((prev) =>
                prev.filter(
                    (hotel) => hotel.approvalStatus === "rejected"
                )
            );
        }

        setIsOpen(prev => !prev)
    };

    const reset = () => {
        document.querySelectorAll('input[type="radio"]').forEach((radio) => {
            radio.checked = false;
        });
        setFilteredHotels((prev) => hotels);
        setSort(null)
        setApprovalStatus(null)
    };

    const getAllSellerHotels = async () => {
        try {
            const response = await axios.get("/user/current-user", {
                withCredentials: true,
            });
            const allOrders = response.data.data.receivedOrders;
            const allHotels = response.data.data.myCreatedPlaces;

            for (let i = 0; i < allHotels.length; i++) {
                allHotels[i].revenue = 0;
                for (let j = 0; j < allOrders.length; j++) {
                    if (allHotels[i]._id === allOrders[j].hotel._id) {
                        allHotels[i].revenue += allOrders[j].amount;
                    }
                }
            }

            setHotels(allHotels);
            setFilteredHotels(allHotels);
            setOrders(allOrders);
        } catch (error) {
            console.log(error);
        }
    };

    const EditPopup = () => {
        setSelectedHotel(null);
        setIsEditOpen((prev) => !prev);
    };

    useEffect(() => {
        getAllSellerHotels();

        socket.on("hotel_is_approved", (data) => {
            setHotels((prev) =>
                prev.map((hotel) =>
                    hotel._id === data.hotel._id ? data.hotel : hotel
                )
            );
        });

        return () => {
            socket.off("new-hotel");
        };
    }, []);
    return (
        <div className="mt-10 ml-2">
            {(selectedHotel || isEditOpen) && (
                <Edit selectedHotel={selectedHotel} EditPopup={EditPopup} />
            )}
            <div className="mb-6 flex justify-between">
                <button
                    onClick={popup}
                    className="btn text-white bg-emerald-600 hover:bg-emerald-700 transition-colors duration-300 shadow-md"
                >
                    Apply Filters
                </button>
                <label className="input input-bordered flex items-center gap-2 mr-6">
                    <input
                        onChange={(e) => setSearchTerm(e.target.value)}
                        type="text"
                        className="grow"
                        placeholder="Search"
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="h-4 w-4 opacity-70"
                    >
                        <path
                            fillRule="evenodd"
                            d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </label>
            </div>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-300 ease-in-out">
                    <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-emerald-700">
                                Filters
                            </h2>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setIsOpen(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={submitHandler} className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Sort By
                                </h3>
                                <div className="space-y-2">
                                    <label className="inline-flex items-center mr-2">
                                        <input
                                            type="radio"
                                            name="sort"
                                            value="p-lowToHigh"
                                            checked={sort === "p-lowToHigh"}
                                            onChange={(e) => setSort(e.target.value)}
                                            className="form-radio text-emerald-600"
                                        />
                                        <span className="ml-2">
                                            Low to High (Price)
                                        </span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="sort"
                                            value="p-highToLow"
                                            checked={sort === "p-highToLow"}
                                            onChange={(e) => setSort(e.target.value)}
                                            className="form-radio text-emerald-600"
                                        />
                                        <span className="ml-2">
                                            High to Low (Price)
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="inline-flex items-center mr-2">
                                        <input
                                            type="radio"
                                            name="sort"
                                            value="r-lowToHigh"
                                            checked={sort === "r-lowToHigh"}
                                            onChange={(e) => setSort(e.target.value)}
                                            className="form-radio text-emerald-600"
                                        />
                                        <span className="ml-2">
                                            Low to High (Revenue)
                                        </span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="sort"
                                            value="r-highToLow"
                                            checked={sort === "r-highToLow"}
                                            onChange={(e) => setSort(e.target.value)}
                                            className="form-radio text-emerald-600"
                                        />
                                        <span className="ml-2">
                                            High to Low (Revenue)
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Approval Status
                                </h3>
                                <div className="space-y-2">
                                    <label className="inline-flex items-center mr-2">
                                        <input
                                            type="radio"
                                            name="ApprovalStatus"
                                            value="approved"
                                            checked={approvalStatus === "approved"}
                                            onChange={(e) => setApprovalStatus(e.target.value)}
                                            className="form-radio text-emerald-600"
                                        />
                                        <span className="ml-2">Approved</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="ApprovalStatus"
                                            value="rejected"
                                            checked={approvalStatus === "rejected"}
                                            onChange={(e) => setApprovalStatus(e.target.value)}
                                            className="form-radio text-emerald-600"
                                        />
                                        <span className="ml-2">Rejected</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors duration-300"
                                >
                                    Apply
                                </button>
                                <button
                                    onClick={reset}
                                    type="button"
                                    className="px-4 py-2 bg-white text-emerald-600 border border-emerald-600 rounded-md hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors duration-300"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr className="font-bold text-lg">
                            <th>S.No.</th>
                            <th className="text-center">Hotel Name</th>
                            <th className="text-center">Price</th>
                            <th className="text-center">City</th>
                            <th className="text-center">State</th>
                            <th className="text-center">Revenue</th>
                            <th className="text-center">Details</th>
                            <th className="text-center">Document</th>
                            <th className="text-center">Status</th>
                            <th className="text-center">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHotels
                            .filter((item) => {
                                return searchTerm.toLowerCase() === ""
                                    ? item
                                    : item.title
                                          .toLowerCase()
                                          .includes(searchTerm.toLowerCase()) ||
                                          item.city
                                              .toLowerCase()
                                              .includes(
                                                  searchTerm.toLowerCase()
                                              ) ||
                                          item.state
                                              .toLowerCase()
                                              .includes(
                                                  searchTerm.toLowerCase()
                                              );
                            })
                            .map((hotel, index) => {
                                return (
                                    <tr key={hotel._id}>
                                        <th>{index + 1}</th>
                                        <td className="text-center">
                                            {hotel.title}
                                        </td>
                                        <td className="text-center">
                                            ₹{" "}
                                            {typeof hotel.price === "number"
                                                ? hotel.price.toLocaleString(
                                                      "en-IN"
                                                  )
                                                : "N/A"}
                                        </td>
                                        <td className="text-center">
                                            {hotel.city}
                                        </td>
                                        <td className="text-center">
                                            {hotel.state}
                                        </td>
                                        <td className="text-center">
                                            {typeof hotel.revenue === "number"
                                                ? hotel.revenue.toLocaleString(
                                                      "en-IN"
                                                  )
                                                : "N/A"}
                                        </td>
                                        <td className="text-center flex justify-center ">
                                            <button
                                                onClick={() => {
                                                    setSelectedHotel(hotel);
                                                    setIsEditOpen();
                                                }}
                                                className="btn bg-zinc-200"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            <Link
                                                target="_blank"
                                                to={`${hotel.pdf}`}
                                            >
                                                <button className="px-3 py-1 bg-zinc-200 rounded-md hover:bg-zinc-300 transition-colors">
                                                    Document
                                                </button>
                                            </Link>
                                        </td>
                                        <td className="text-center">
                                            {hotel.approvalStatus ===
                                            "approved" ? (
                                                <button className="btn bg-green-500 text-white hover:bg-white hover:border-green-500 hover:border-2 hover:text-black transition-all duration-500">
                                                    Approved
                                                </button>
                                            ) : hotel.approvalStatus ===
                                              "pending" ? (
                                                <button className="btn bg-yellow-500 text-white">
                                                    Pending
                                                </button>
                                            ) : (
                                                <button className="btn bg-red-500 text-white">
                                                    Rejected
                                                </button>
                                            )}
                                        </td>
                                        <td>
                                            <button onClick={() => deleteRequest(hotel._id)} className="btn bg-red-500 text-white">
                                                Request Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SellerHotels;

const Container = styled.div`
    padding: 20px;
    background-color: #f0f0f0;
    color: #333;
    font-family: "Josefin Sans", sans-serif;
    font-optical-sizing: auto;
    font-weight: 400;
    font-style: normal;
`;

const Title = styled.h2`
    color: #2a9d8f;
    margin-bottom: 20px;
    text-align: center;
    font-size: 32px;
    font-weight: bold;
`;

const CreateButton = styled.button`
    padding: 10px;
    background-color: #2a9d8f;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: block;
    margin: 0 auto 20px;
`;

const ScrollableContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const BookingCard = styled.div`
    display: flex;
    flex-direction: row;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
    }
`;

const Image = styled.img`
    width: 150px;
    height: 150px;
    border-radius: 8px;
    margin-right: 20px;
    @media (max-width: 768px) {
        margin-right: 0;
        margin-bottom: 20px;
    }
`;

const Description = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 14px;
    color: #333;
`;

const PopupOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const Popup = styled.div`
    display: flex;
    flex-direction: column;
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    max-height: 80%;
    overflow-y: auto;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    position: relative;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
`;

const ScrollablePopupContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const ImageUploadContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: space-between;
`;

const ImageUpload = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 48%;
    position: relative;
`;

const ImageInput = styled.input`
    display: none;
`;

const PopupImage = styled.img`
    width: 100%;
    height: auto;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 10px;
`;

const AddImageButton = styled.button`
    padding: 10px;
    background-color: #2a9d8f;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    align-self: center;
`;

const Label = styled.label`
    font-size: 14px;
    color: #333;
`;

const Input = styled.input`
    width: 100%;
    padding: 6px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
`;

const CheckboxContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`;

const CheckboxLabel = styled.label`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100px;
    text-align: center;
    background-color: ${({ checked }) => (checked ? "#CAFFCB" : "#fff")};
    border-color: ${({ checked }) => (checked ? "#04AF70" : "#ddd")};
    box-shadow: ${({ checked }) =>
        checked
            ? "0 4px 8px rgba(0, 0, 0, 0.2)"
            : "0 2px 4px rgba(0, 0, 0, 0.1)"};

    &:hover {
        border-color: #04af70;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
`;

const HiddenCheckbox = styled.input.attrs({ type: "checkbox" })`
    display: none;
`;

const SubmitButton = styled.button`
    padding: 10px;
    background-color: #2a9d8f;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
    align-self: center;
`;
