import { useEffect, useState } from "react";
import "./index.css";
import logo from "./image/Logo_Hust.png";
import axios from "axios";
import { HumidityChart, SmokeChart, TemperatureChart } from "./ChartDetail2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useNavigate } from "react-router-dom";

import { getDatabase, ref, onValue } from "firebase/database";

import imgOffline from './image/OFFLINE.png'
import imgOnline from './image/ONLINE.png'
import { useAuth } from './components/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend);
const listenToFirebaseData = (refName, updateFunction) => {
  const dataRef = ref(getDatabase(), refName);

  const handleValueChange = (snapshot) => {
    const newData = snapshot.val();
    updateFunction(newData);
    console.log(`Dữ liệu ${refName} thay đổi:`, newData);
  };

  onValue(dataRef, handleValueChange);

  return () => {
    dataRef.off("value", handleValueChange);
  };
};
function App2() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [humiData, sethumiData] = useState(0);
  const [smokeData, setsmokeData] = useState(0);
  const [tempData, settempData] = useState(0);
  const [sosData, setsosData] = useState(0);
  const [status, setstatus] = useState(1);
  const [timestamp, settimestamp] = useState(0);
  const [newtimestamp, setnewtimestamp] = useState(0);
  const { isLoggedIn, logout } = useAuth();
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, []);

  const handleLogout = () => {
    logout(); // Đăng xuất người dùng
    localStorage.setItem("isLoggedIn", false);
    navigate('/login'); // Chuyển hướng đến trang login
  };

  // //--------

  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  useEffect(() => {
    const updateTimeAndDate = () => {
      const now = new Date();

      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      const timeString = `${hours}:${minutes}:${seconds}`;

      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      const dateString = now.toLocaleDateString("vi-VN", options);

      setTime(timeString);
      setDate(dateString);
    };

    updateTimeAndDate();
    const intervalID = setInterval(updateTimeAndDate, 1000);

    return () => {
      clearInterval(intervalID);
    };
  }, []);
  useEffect(() => {
    getValueData();
    getStatusData();
  }, []);
  const getValueData = async () => {
    try {
      const response = await axios.get(
        "https://test2-d9c33-default-rtdb.firebaseio.com/read.json"
      );
      const result = response?.data;
      sethumiData(result?.humi);
      setsmokeData(result?.smoke);
      settempData(result?.temp);
      console.log("data", result);
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const toggleSos = () => {
    // Đảo ngược giá trị sosData
    const newSosData = sosData === 0 ? 1 : 0;
    setsosData(newSosData);
  };


 //Sử dụng hàm listenToFirebaseData để lắng nghe và cập nhật dữ liệu cho các biến
 useEffect(() => {
  listenToFirebaseData("read/humi", sethumiData);
  listenToFirebaseData("read/smoke", setsmokeData);
  listenToFirebaseData("read/temp", settempData);
  listenToFirebaseData("rw/sos", setsosData);
  listenToFirebaseData("online/timestamp", settimestamp);
}, []);


//   const lastTimestamp = timestamp;

  const getStatusData = async () => {
    try {
      const response = await axios.get(
        "https://test2-d9c33-default-rtdb.firebaseio.com/online.json"
      );
      const result = response?.data;
      console.log('result', result);
      setnewtimestamp(result?.timestamp);
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    const intervalId = setInterval(getStatusData, 100000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (lastTimestamp !== newtimestamp) {
      // Giữ lại timestamp mới nhất

      setstatus(1);
    } else {
      setstatus(0); // Cập nhật status thành 0 nếu timestamp bằng lastTimestamp
    }
  }, [lastTimestamp, newtimestamp]);

  const lastTimestamp = timestamp;

  return (
    <div className="content">
      <div className="header-main">
        <div style={{ backgroundColor: "white", borderRadius: "50%" }}>
          <img src={logo} style={{ width: "50px", height: "auto" }} />
        </div>
        <div className="text-header-main">
          <p style={{ marginBottom: "0px", fontWeight: "bold", textAlign: 'center' }}>
            HỆ THỐNG PHÁT HIỆN VÀ CẢNH BÁO CHÁY SỚM
          </p>
        </div>
        <div className="header-right" style={{ position: "relative" }}>
          <div
            className="dropdown-icon"
            onClick={toggleDropdown}
            style={{
              cursor: "pointer",
              display: "inline-block",
              marginRight: "20px",
              fontSize: "30px",
            }}
          >
            &#9776;
          </div>
          {showDropdown && (
            <div className="dropdown-content">
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: "transparent",
                  color: "black",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  padding: "10px",
                  textAlign: "left",
                }}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>

      </div>

      <div className="header-content">
        <div className="row align-items-center">
          <div className="col-sm-1"></div>
          <div className="col-sm-10">
            <div className="date-time">
              <div style={{ fontSize: "large", fontWeight: "bolder" }}>{date}</div>
              <div style={{ fontSize: "large" }}>{time}</div>
            </div>
          </div>
          <div className="col-sm-1">
            {status == 1 ? (
              <img src={imgOnline} className="img-status" alt="Sample image" />
            ) : (
              <img src={imgOffline} className="img-status" alt="Sample image" />
            )}
          </div>
        </div>
      </div>

      <div className="textStatus" style={{ color: status === 1 ? 'green' : 'red' }}>
        Trạng thái: {status === 1 ? 'Đang hoạt động' : 'Mất kết nối'}
      </div>



      <div className="sos-btn">
        <div
          className={`toggle-switch ${sosData === 1 ? "active" : ""}`}
          style={{ borderColor: "red" }}
          onClick={toggleSos}
        >
          <div className={`text-sos-off ${sosData === 1 ? "hidden" : ""}`}>
            {sosData === 1 ? "Đang báo động" : "Trượt để báo động"}
          </div>
          <div className={`text-sos-on ${sosData === 1 ? "" : "hidden"}`}>
            Đang báo động
          </div>
          <div className={`toggle-slider ${sosData === 1 ? "active" : ""}`}>
            <p style={{ margin: "0px" }}>SOS</p>
          </div>
        </div>
      </div>
      <div className={`content ${status == 0 ? "grayed-out" : ""}`}>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="chart">
            <div className="text-box">Giám sát</div>
            <HumidityChart humidity={humiData} />
            <SmokeChart smoke={smokeData} />
            <TemperatureChart temperature={tempData} />
          </div>
        )}

      </div>
      {/* <div className="textStatusWeb" style={{ color: status === 1 ? 'green' : 'red' }}>
        Trạng thái thiết bị: {status === 1 ? 'Đang hoạt động' : 'Mất kết nối'}
      </div> */}
    </div>
  );
}

export default App2;
