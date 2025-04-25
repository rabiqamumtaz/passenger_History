import {toast} from "react-toastify"
import React, { useState, useEffect } from "react";
import "./users.css";
import axios from '../../axios';
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaChevronDown,
  FaCalendarAlt,
  FaPencilAlt,
  FaHistory,
  FaEye
} from "react-icons/fa";
import { BsTrash3 } from "react-icons/bs";
import { IoCloseSharp } from "react-icons/io5";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // import styles for the date picker
import Profile from "../../Assets/Logo/profile.jpg";
const Passenger = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState([null, null]); // Start and end date in one state
  const [calendarOpen, setCalendarOpen] = useState(false); // Manage calendar open state
  const [popupOpen, setPopupOpen] = useState(false);
  const [editedPassenger, setEditedPassenger] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false); // Toggle for delete confirmation popup
  const [historyPopupOpen, setHistoryPopupOpen] = useState(false); // Toggle for ride history popup
  const [passengerRideHistory, setPassengerRideHistory] = useState([]); // State for ride history
  const [passengers, setPassengers] = useState([]);

 
  

  const API_URL = `/api/web/passengers`;
  // Close popup
  const closePopup = () => {
    setPopupOpen(false);
    setEditMode(false);
    setDeletePopupOpen(false);
    setHistoryPopupOpen(false);
    setSelectedPassenger(null);
  };

  // Handle delete button click
  const handleDeleteClick = (passenger) => {
    setSelectedPassenger(passenger);
    setDeletePopupOpen(true); // Open the delete confirmation popup
  };

  // Handle ride history view
  const handleViewRideHistory = async (passenger) => {
    setSelectedPassenger(passenger);
    
    try {
      // Fetch passenger ride history
      const response = await axios.get(`${API_URL}/${passenger._id}/rides`);
      setPassengerRideHistory(response.data || []);
      
      // If you don't have an endpoint for ride history yet, you can use mock data:
      /*
      setPassengerRideHistory([
        { 
          id: '1',
          date: '2025-04-20',
          from: 'Downtown',
          to: 'Airport',
          fare: '$42.50',
          status: 'Completed'
        },
        { 
          id: '2',
          date: '2025-04-15',
          from: 'Mall',
          to: 'University',
          fare: '$18.75',
          status: 'Completed'
        },
        // Add more mock ride history items as needed
      ]);
      */
      
      setHistoryPopupOpen(true);
    } catch (error) {
      console.error("Error fetching ride history:", error);
      toast.error("Failed to fetch ride history. Please try again.");
    }
  };

  // Fetch dispatchers from backend
  useEffect(() => {
    fetchDispatchers();
  }, []);

  const fetchDispatchers = async () => {
    try {
      const response = await axios.get(API_URL);
      setPassengers(response.data);
      setLoading(false);
      toast.success("Dispatchers fetched successfully!");

    } catch (error) {
      console.error("Error fetching Passengers:", error);
      setLoading(false);
      toast.error("Failed to fetch dispatchers. Please try again.");
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedPassenger) return;
    try {
      await axios.delete(`${API_URL}/${selectedPassenger._id}`);
      setPassengers(passengers.filter((d) => d._id !== selectedPassenger._id));
      closePopup();
      toast.success("Passenger deleted successfully!")
    } catch (error) {
      console.error("Error deleting dispatcher:", error);
      toast.error("Failed to delete passenger. Please try again.")
    }
  };

  const handleEditProfile = () => {
    // Create a hidden file input for selecting the new profile image
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    // Handle file selection
    fileInput.onchange = (event) => {
      const file = event.target.files[0];

      if (file) {
        // Validate file size (e.g., max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          alert("File size should not exceed 2MB.");
          return;
        }

        // Simulate previewing the uploaded image (as we are frontend only)
        const reader = new FileReader();
        reader.onload = () => {
          setSelectedPassenger((prev) => ({
            ...prev,
            profilePicture: reader.result, // Preview image as base64
          }));
        };

        // Read the file as Data URL (base64)
        reader.readAsDataURL(file);
      }
    };

    // Trigger file input click
    fileInput.click();
  };

  const entriesPerPage = 7;
  const totalPages = Math.ceil(passengers.length / entriesPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const openViewPopup = (passenger) => {
    setSelectedPassenger(passenger);
    setPopupOpen(true);
    setEditMode(false);
  };

  const openEditMode = () => {
    setEditMode(true);
    setEditedPassenger({ ...selectedPassenger }); // Create a copy to edit
  };

  const handleSaveChanges = () => {
    setPassengers((prevState) =>
      prevState.map((passenger) =>
        passenger._id === selectedPassenger._id ? editedPassenger : passenger
      )
    );
    setSelectedPassenger(editedPassenger); // Update selected passenger
    closePopup();
  };


  const handleInputChange = (field, value) => {
    setEditedPassenger({
      ...editedPassenger,
      [field]: value,
    });
  };


  const toggleCalendar = () => {
    setCalendarOpen(!calendarOpen);
  };
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setSelectedDateRange([null, null]);
    setCurrentPage(1);
  };

  const filteredPassengers = passengers.filter((passenger) => {
    const matchesSearch = passenger.passengerName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter
      ? passenger.status === statusFilter
      : true;

    // Date filtering logic for inclusive range
    const passengerDate = new Date(passenger.date);
    const [startDate, endDate] = selectedDateRange;

    // Normalize both start and end dates to midnight to ensure correct comparison
    const normalizeDate = (date) => {
      if (!date) return null;
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0); // Set to midnight
      return normalizedDate;
    };

    const normalizedStartDate = normalizeDate(startDate);
    const normalizedEndDate = normalizeDate(endDate);

    const matchesDateRange =
      (normalizedStartDate ? passengerDate >= normalizedStartDate : true) &&
      (normalizedEndDate ? passengerDate <= normalizedEndDate : true);

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const displayedPassengers = filteredPassengers.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const totalEntries = filteredPassengers.length;
  const startEntry = (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, totalEntries);

  return (
    <div className="user-management">
      <h2 className="page-title">Passengers</h2>

      <div className="filters">
        <div className="left">
          <div className="passenger-input-container">
            <input
              type="text"
              className="left-input"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="input-icon" />
          </div>

          <div className="passenger-select-container">
            <select
              className="left-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <FaChevronDown className="select-icon" />
          </div>
          <div className="passenger-date-container">
            <DatePicker
              className="left-date"
              selected={selectedDateRange[0]}
              onChange={(dates) => setSelectedDateRange(dates)} // Select both start and end date
              startDate={selectedDateRange[0]}
              endDate={selectedDateRange[1]}
              selectsRange
              dateFormat="yyyy-MM-dd"
              placeholderText="Select Date Range"
              open={calendarOpen} // Bind open state to DatePicker
              onClickOutside={() => setCalendarOpen(false)} // Close calendar on outside click
            />
            <FaCalendarAlt className="date-icon" onClick={toggleCalendar} />{" "}
            {/* Icon triggers calendar */}
          </div>
        </div>

        <div className="right">
          <button className="reset-btn" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </div>

      <div className="table-cont">
        <table className="user-table">
          <thead>
            <tr>
              <th>Sr.</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Rides</th>
              <th>Status</th>
              <th>Ride History</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedPassengers.map((passenger, index) => (
              <tr key={passenger._id}>
                <td>{(currentPage - 1) * entriesPerPage + index + 1}</td>
                <td>{passenger.passengerName}</td>
                <td>{passenger.passengerContact}</td>
                <td>{passenger.passengerEmail}</td>
                <td>{passenger.passengerRide}</td>
                <td>{passenger.status}</td>
                <td>
                  <div className="history-cell">
                    <span>{passenger.date}</span>
                    <button 
                      className="view-history-link"
                      onClick={() => handleViewRideHistory(passenger)}
                    >
                      <FaEye /> View
                    </button>
                  </div>
                </td>
                <td>
                  <button className="popupedit-btn">
                    <FaPencilAlt onClick={() => openViewPopup(passenger)} />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteClick(passenger)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <div className="entries-info">
            Showing {startEntry} to {endEntry} of {totalEntries} entries
          </div>
          <div className="entry-buttons">
            <span
              className="pagination-text"
              onClick={() => handlePageChange(currentPage - 1)}
              style={{ cursor: currentPage > 1 ? "pointer" : "not-allowed" }}
            >
              Previous
            </span>
            {Array.from({ length: totalPages }, (_, index) => (
              <span
                key={index}
                className={`pagination-link ${currentPage === index + 1 ? "active" : ""
                  }`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </span>
            ))}
            <span
              className="pagination-text"
              onClick={() => handlePageChange(currentPage + 1)}
              style={{
                cursor: currentPage < totalPages ? "pointer" : "not-allowed",
              }}
            >
              Next
            </span>
          </div>
        </div>

        {/* Passenger Details Popup */}
        {popupOpen && (
          <div className="popup-overlay">
            {editMode ? (
              <div className="edit-popup">
                <div className="edit-header">
                  <h3>Passenger Details</h3>
                  <button className="close-btn" onClick={closePopup}>
                    <IoCloseSharp />
                  </button>
                </div>
                <div className="profile-section">
                  <img
                    src={selectedPassenger.profile || Profile} // Use imported image directly here
                    alt="Passenger Profile"
                    className="profile-image"
                  />
                  <button className="edit-icon-btn" onClick={handleEditProfile}>
                    <FaEdit className="edit-icon" />
                  </button>
                </div>

                <div className="basic-details">
                  <div className="field-row">
                    <div className="popup-field">
                      <label>Name:</label>
                      <input
                        type="text"
                        value={editedPassenger?.passengerName || ""}
                        onChange={(e) => handleInputChange("passengerName", e.target.value)}
                      />

                    </div>
                    <div className="popup-field">
                      <label>Contact:</label>
                      <input
                        type="text"
                        value={editedPassenger?.passengerContact || ""}
                        onChange={(e) => handleInputChange("passengerContact", e.target.value)}
                      />

                    </div>
                  </div>

                  <div className="field-row">
                    <div className="popup-field">
                      <label>Email:</label>
                      <input
                        type="text"
                        value={editedPassenger?.passengerEmail || ""}
                        onChange={(e) => handleInputChange("passengerEmail", e.target.value)}
                      />

                    </div>
                    <div className="popup-field">
                      <label>Gender:</label>
                      <input
                        type="text"
                        value={editedPassenger?.pass || ""}
                        onChange={(e) => handleInputChange("passengerGender", e.target.value)}
                      />

                    </div>
                  </div>
                </div>
                <div className="ride-details">
                  <h3>Passenger Ride Details</h3>
                  <div className="popup-box">
                    <div className="popup-lable">
                      <p>Total Rides:</p>
                    </div>
                    <div className="popup-entries">
                      <p>{selectedPassenger.passengerRide}</p>
                    </div>
                  </div>
                </div>
                <div className="popup-footer">
                  <button onClick={handleSaveChanges} className="edit-btn">
                    Update
                  </button>
                </div>
              </div>
            ) : (
              <div className="details-popup">
                <div className="detail-header">
                  <p className="status">
                    <p>Status: {selectedPassenger.status}</p>
                  </p>
                  <button className="close-btn" onClick={closePopup}>
                    <IoCloseSharp />
                  </button>
                </div>
                <div className="basic-details">
                  <h3>Passenger Details</h3>
                  <div className="profileimage-box">
                    <div className="popup-lable">
                      <p>Name: </p>
                    </div>

                    <div className="profileimage-entries">
                      <img
                        src={selectedPassenger.profile || Profile} // Use imported image directly here
                        alt="Passenger Profile"
                        className="viewprofile-image"
                      />
                      <p> {selectedPassenger.passengerName}</p>
                    </div>
                  </div>
                  <div className="popup-box">
                    <div className="popup-lable">
                      <p>Contact:</p>
                      <p>Gender:</p>
                      <p>Email:</p>
                    </div>
                    <div className="popup-entries">
                      <p>{selectedPassenger.passengerContact}</p>
                      <p>{selectedPassenger.passengerGender}</p>
                      <p>{selectedPassenger.passengerEmail}</p>
                    </div>
                  </div>
                </div>
                <div className="ride-details">
                  <h3>Passenger Ride Details</h3>
                  <div className="popup-box">
                    <div className="popup-lable">
                      <p>Total Rides:</p>
                    </div>
                    <div className="popup-entries">
                      <p>{selectedPassenger.passengerRide}</p>
                    </div>
                  </div>
                </div>
                <div className="popup-footer">
                  <button onClick={openEditMode} className="edit-btn">
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Popup */}
        {deletePopupOpen && (
          <div className="popup-overlay">
            <div className="delete-popup">
              <div className="delete-header">
                <button className="close-btn" onClick={closePopup}>
                  <IoCloseSharp />
                </button>
              </div>

              <div className="delete-icon">
                <BsTrash3 />
                <p>Delete User</p>
              </div>
              <div className="delete-content">
                <p>
                  Are you sure you want to delete <strong>
                    {selectedPassenger?.name}?
                  </strong>
                </p>
              </div>
              <div className="delete-footer">
                <button onClick={closePopup} className="cancel-btn">
                  No Keep
                </button>
                <button onClick={confirmDelete} className="confirm-btn">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ride History Popup */}
        {historyPopupOpen && selectedPassenger && (
          <div className="popup-overlay">
            <div className="history-popup">
              <div className="history-header">
                <h3>Ride History - {selectedPassenger.passengerName}</h3>
                <button className="close-btn" onClick={closePopup}>
                  <IoCloseSharp />
                </button>
              </div>
              <div className="history-content">
                {passengerRideHistory.length > 0 ? (
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Fare</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {passengerRideHistory.map((ride) => (
                        <tr key={ride.id}>
                          <td>{ride.date}</td>
                          <td>{ride.from}</td>
                          <td>{ride.to}</td>
                          <td>{ride.fare}</td>
                          <td>{ride.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-history">
                    <FaHistory className="history-icon" />
                    <p>No ride history available for this passenger.</p>
                  </div>
                )}
              </div>
              <div className="history-footer">
                <button onClick={closePopup} className="close-history-btn">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Passenger;




// ===================== //

/* Ride history link in table */
// .history-cell {
//     display: flex;
//     flex-direction: column;
//     gap: 5px;
//   }
  
//   .view-history-link {
//     background: none;
//     border: none;
//     color: #0069d9;
//     cursor: pointer;
//     display: inline-flex;
//     align-items: center;
//     gap: 5px;
//     font-size: 14px;
//     padding: 0;
//   }
  
//   .view-history-link:hover {
//     text-decoration: underline;
//     color: #0056b3;
//   }
  
//   /* Ride History Popup */
//   .history-popup {
//     background-color: #fff;
//     width: 80%;
//     max-width: 800px;
//     max-height: 80vh;
//     border-radius: 10px;
//     box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
//     overflow: hidden;
//     display: flex;
//     flex-direction: column;
//   }
  
//   .history-header {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     padding: 16px 20px;
//     background-color: #f8f9fa;
//     border-bottom: 1px solid #ddd;
//   }
  
//   .history-header h3 {
//     margin: 0;
//     font-size: 18px;
//     color: #333;
//   }
  
//   .history-content {
//     padding: 20px;
//     overflow-y: auto;
//     flex-grow: 1;
//   }
  
//   .history-table {
//     width: 100%;
//     border-collapse: collapse;
//   }
  
//   .history-table th, 
//   .history-table td {
//     padding: 12px 15px;
//     text-align: left;
//     border-bottom: 1px solid #ddd;
//   }
  
//   .history-table th {
//     background-color: #f8f9fa;
//     font-weight: 600;
//     color: #333;
//   }
  
//   .history-table tr:hover {
//     background-color: #f8f9fa;
//   }
  
//   .no-history {
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     justify-content: center;
//     padding: 40px 0;
//     color: #6c757d;
//   }
  
//   .history-icon {
//     font-size: 48px;
//     margin-bottom: 16px;
//     opacity: 0.6;
//   }
  
//   .history-footer {
//     padding: 16px 20px;
//     border-top: 1px solid #ddd;
//     display: flex;
//     justify-content: flex-end;
//   }
  
//   .close-history-btn {
//     padding: 8px 16px;
//     background-color: #6c757d;
//     color: white;
//     border: none;
//     border-radius: 4px;
//     cursor: pointer;
//     font-size: 14px;
//   }
  
//   .close-history-btn:hover {
//     background-color: #5a6268;
//   }