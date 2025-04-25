// First, add a state for the ride history popup and the selected passenger's rides:


const [rideHistoryPopupOpen, setRideHistoryPopupOpen] = useState(false);
const [passengerRides, setPassengerRides] = useState([]);


// Add a function to fetch ride history when the view link is clicked:

const fetchPassengerRides = async (passengerId) => {
  try {
    // Replace with your actual API endpoint for fetching passenger rides
    const response = await axios.get(`/api/web/passengers/${passengerId}/rides`);
    setPassengerRides(response.data);
    setRideHistoryPopupOpen(true);
  } catch (error) {
    console.error("Error fetching passenger rides:", error);
    toast.error("Failed to fetch ride history. Please try again.");
  }
};

// Modify the table column to include a "View" link:


<td>
  <button 
    className="view-link" 
    onClick={() => fetchPassengerRides(passenger._id)}
  >
    View
  </button>
</td>

// Add CSS for the view link in your users.css:


// .view-link {
//   background: none;
//   border: none;
//   color: #3498db;
//   text-decoration: underline;
//   cursor: pointer;
//   padding: 0;
//   font-size: 14px;
// }

// .view-link:hover {
//   color: #2980b9;
// }

// Add the ride history popup component at the bottom of your return statement (just before the last closing </div>):

{rideHistoryPopupOpen && (
    <div className="popup-overlay">
      <div className="ride-history-popup">
        <div className="popup-header">
          <h3>Ride History for {selectedPassenger?.passengerName}</h3>
          <button className="close-btn" onClick={() => setRideHistoryPopupOpen(false)}>
            <IoCloseSharp />
          </button>
        </div>
        
        <div className="ride-history-content">
          {passengerRides.length > 0 ? (
            <table className="ride-history-table">
              <thead>
                <tr>
                  <th>Ride ID</th>
                  <th>Date</th>
                  <th>Pickup</th>
                  <th>Destination</th>
                  <th>Fare</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {passengerRides.map((ride) => (
                  <tr key={ride._id}>
                    <td>{ride.rideId}</td>
                    <td>{new Date(ride.date).toLocaleDateString()}</td>
                    <td>{ride.pickupLocation}</td>
                    <td>{ride.destination}</td>
                    <td>${ride.fare}</td>
                    <td>{ride.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No ride history found for this passenger.</p>
          )}
        </div>
      </div>
    </div>
  )}

//   Add these styles to your users.css:

// .ride-history-popup {
//     background: white;
//     border-radius: 8px;
//     padding: 20px;
//     width: 80%;
//     max-width: 900px;
//     max-height: 80vh;
//     overflow-y: auto;
//   }
  
//   .ride-history-content {
//     margin-top: 20px;
//   }
  
//   .ride-history-table {
//     width: 100%;
//     border-collapse: collapse;
//     margin-top: 15px;
//   }
  
//   .ride-history-table th, 
//   .ride-history-table td {
//     padding: 10px;
//     border: 1px solid #ddd;
//     text-align: left;
//   }
  
//   .ride-history-table th {
//     background-color: #f2f2f2;
//   }
  
//   .ride-history-table tr:nth-child(even) {
//     background-color: #f9f9f9;
//   }

