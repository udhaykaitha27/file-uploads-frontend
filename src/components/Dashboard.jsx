import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaDownload, FaFolderOpen } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { FaFolderClosed } from "react-icons/fa6";
// // import { FaArrowCircleUp } from "react-icons/fa";
// import { BsFiletypePptx } from "react-icons/bs";
// import { FaRegFilePdf } from "react-icons/fa6";
// import { BsFiletypeXlsx } from "react-icons/bs";
// import { FaRegFileWord } from "react-icons/fa";
// // import { FaFolderOpen } from "react-icons/fa";
// import { FaFile } from "react-icons/fa";
// import { SiMicrosoftexcel } from "react-icons/si";

import Modal from "react-bootstrap/Modal";

function Dashboard() {
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [files, setFiles] = useState([]);
  const [fileUploads, setFileUploads] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [showModal, setShowModal] = useState(false);
  const [fileSep, setFileSep] = useState([]);
  const [loader, setLoader] = useState(false);

console.log(fileSep);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await axios.get(
          "http://localhost/backendPHP/api.php",
          {
            params: {
              action: "get_folders",
              user_id: user.userId,
            },
          }
        );
        console.log(response);
        if (response.data.folders) {
          setFolders(response.data.folders);
          localStorage.setItem(
            "folders",
            JSON.stringify(response.data.folders)
          );
        }
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    };

    const storedFolders = localStorage.getItem("folders");
    if (storedFolders) {
      setFolders(JSON.parse(storedFolders));
    } else {
      fetchFolders();
    }


    const fetchFiles = async () => {
      try {
        const response = await axios.get("http://localhost/backendPHP/api.php", {
          params: {
            action: "get_files_sep",
            user_id: user.userId, // Pass the user_id from localStorage
          },
        });

        if (response.data.files) {
          const userFiles = response.data.files; // Store the user files from the API response
          setFileSep(userFiles);
          localStorage.setItem("fileSep", JSON.stringify(userFiles)); // Store files in localStorage
        }
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    // Retrieve files from localStorage if available
    const storedFiles = localStorage.getItem("fileSep");
    if (storedFiles) {
      setFileSep(JSON.parse(storedFiles)); // Set the files from localStorage
    } else {
      fetchFiles(); // Fetch files if not available in localStorage
    }
  }, [user.userId]);


  // const renderFileTypeIcon = (fileName) => {
  //   const fileExtension = fileName.split(".").pop().toLowerCase(); // Extract file extension

  //   switch (fileExtension) {
  //     case "pptx":
  //       return <BsFiletypePptx color="red" />;
  //     case "pdf":
  //       return <FaRegFilePdf color="blue" />;
  //     case "xlsx":
  //       return <BsFiletypeXlsx color="green" />;
  //     case "docx":
  //       return <FaRegFileWord color="violet" />;
  //     case "xls":
  //       return <SiMicrosoftexcel color="info" />;
  //     default:
  //       return <FaFile />;
  //   }
  // };


  const handleFileUploadSep = async (event) => {
    setLoader(true); // Show loader while uploading file
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", user.userId); // Attach user_id when uploading a file

    try {
      const response = await axios.post(
        "http://localhost/backendPHP/api.php",
        formData,
        {
          params: {
            action: "upload_file_sep",
          },
        }
      );

      console.log(response);

      if (response.data.status === "success") {
        const newFile = {
          file_name: file.name,
          file_path: response.data.file_path,
          id: response.data.fileId,
        };

        const updatedFiles = [...fileSep, newFile];
        setFileSep(updatedFiles); // Update the files state
        setLoader(false); // Hide the loader
        localStorage.setItem("fileSep", JSON.stringify(updatedFiles)); // Update files in localStorage
        event.target.value = ""; // Clear the input after upload
      } else {
        alert("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
    }
  };

  const handleFileDeleteSep = async (fileId) => {
    console.log(fileId)
    try {
      const response = await axios.get("http://localhost/backendPHP/api.php", {
        params: {
          action: "delete_file_sep",
          file_id: fileId, // Pass the fileId to delete
          user_id: user.userId, // Pass user_id from localStorage
        },
      });
     console.log(response);
      if (response.data.status == "success") {
        // Filter out the deleted file from the state and localStorage
        const updatedFiles = fileSep.filter((file) => file.id !== fileId);
        setFileSep(updatedFiles); // Update the state
        localStorage.setItem("fileSep", JSON.stringify(updatedFiles)); // Update localStorage
      } else {
        alert("File deletion failed");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file");
    }
  };

  const handleFileDownloadSep = async (filePath) => {
    const response = await axios.get("http://localhost/backendPHP/api.php", {
      params: { action: "download_file_sep", file_path: filePath },
      responseType: "blob", // Set response type to blob for file download
    });

    // Create a link element to download the file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filePath.split("/").pop());
    document.body.appendChild(link);
    link.click();
  };


  const handleFolderClick = async (folderId) => {
    setSelectedFolderId(folderId);
    setFileUploads(true);

    const response = await axios.get("http://localhost/backendPHP/api.php", {
      params: {
        action: "get_files",
        user_id: user.userId,
        folder_id: folderId,
      },
    });
    setFiles(response.data.files);
  };



  const handleFileUpload = async (e) => {
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    formData.append("folder_id", selectedFolderId);
    formData.append("user_id", user.userId);

    await axios.post(
      "http://localhost/backendPHP/api.php?action=upload_file",
      formData
    );
    handleFolderClick(selectedFolderId); // Refresh file list after upload
  };




  const handleFileDownload = async (filePath) => {
    const response = await axios.get("http://localhost/backendPHP/api.php", {
      params: { action: "download_file", file_path: filePath },
      responseType: "blob", // Set response type to blob for file download
    });

    // Create a link element to download the file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filePath.split("/").pop());
    document.body.appendChild(link);
    link.click();
  };

  

  const handleFileDelete = async (fileId) => {
    const response = await axios.get("http://localhost/backendPHP/api.php", {
      params: {
        action: "delete_file",
        file_id: fileId,
        user_id: user.userId,
      },
    });
    console.log(response);
    handleFolderClick(selectedFolderId); // Refresh file list after deletion
  };



  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("folders");
    window.location.href = "/data_upload/";
  };



  const handleCreateFolder = async () => {
    const folderName = prompt("Enter folder name:");
    if (folderName) {
        const formData = new FormData();
        formData.append("user_id", user.userId);
        formData.append("folder_name", folderName);

        const response = await axios.post(
            "http://localhost/backendPHP/api.php?action=create_folder",
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (response.data.status === "success") {
            const newFolder = {
                id: response.data.folder_id,
                folder_name: folderName,
                folder_path: response.data.folder_path
            };

            const updatedFolders = [...folders, newFolder];
            setFolders(updatedFolders);

            // Save updated folders to local storage
            localStorage.setItem("folders", JSON.stringify(updatedFolders));
            alert("Folder created successfully");
        } else {
            alert(response.data.message);
        }
    }
};




// const handleFolderUpload = async (event) => {
//   const folderName = prompt("Enter folder name for uploaded files:");
//   if (folderName) {
//       const formData = new FormData();
//       formData.append("user_id", user.userId);
//       formData.append("folder_name", folderName);

//       Array.from(event.target.files).forEach((file) => {
//           formData.append("files[]", file);
//       });

//       const response = await axios.post(
//           "http://localhost/backendPHP/api.php?action=upload_folder",
//           formData,
//           { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       if (response.data.status === "success") {
//           const newFolder = {
//               id: response.data.folder_id,
//               folder_name: folderName,
//               folder_path: response.data.folder_path
//           };

//           const updatedFolders = [...folders, newFolder];
//           setFolders(updatedFolders);

//           // Save updated folders to local storage
//           localStorage.setItem("folders", JSON.stringify(updatedFolders));
//           alert("Folder and files uploaded successfully");
//       } else {
//           alert(response.data.message);
//       }
//   }
// };




  const handleDeleteFolder = async (folderId) => {
    setFileUploads(false);
    const response = await axios.get("http://localhost/backendPHP/api.php", {
      params: {
        action: "delete_folder",
        user_id: user.userId,
        folder_id: folderId,
      },
    });

    if (response.data.status === "success") {
      const updatedFolders = response.data.folders; // Use backend-provided folder list
      setFolders(updatedFolders);
      localStorage.setItem("folders", JSON.stringify(updatedFolders));
    } else {
      alert("Folder deletion failed");
    }
  };



  const openDeleteModal = (folderId) => {
    setSelectedFolderId(folderId);
    setShowModal(true);
  };



  const confirmDeleteFolder = () => {
    handleDeleteFolder(selectedFolderId);
    setShowModal(false);
    setSelectedFolderId(null);
  };


  

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <img
          height="50"
          src="https://multiplierai.co/wp-content/uploads/2022/06/multiplier_logo.png"
          alt="Logo"
          className="company-logo"
        />
        <div className="profile-section">
          <span className="user-name">{user.userName}</span>
          <CgProfile className="profile-icon" />
          <IoLogOut className="logout-icon" onClick={handleLogout} />
        </div>
      </div>
      <div className="d-flex justify-content-between">
        {/* <form id="uploadForm" encType="multipart/form-data" method="POST">
          <div className="upload-btn-wrapper ms-2">
            <button className="btn">Upload a folder</button>
            <input
              type="file"
              name="folder"
              webkitdirectory="true"
              multiple
              onChange={handleFolderUpload}
            />
          </div>
        </form> */}


<div className="d-flex">
        <div className="upload-btn-wrapper">
          <button className="btn">Upload a file</button>
          <input type="file" onChange={handleFileUploadSep} name="myfile" />
        </div>
        {loader && (
          <div
            className="spinner-border border-2 light-spinner ms-3 mt-1"
            style={{ width: "1.5rem", height: "1.5rem", color: "#7C3784" }}
            role="status"
          >
            <span className="sr-only"></span>
          </div>
        )}
      </div>

        <div>
          <button className="btn" onClick={handleCreateFolder}>
            Create Folder
          </button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Folder Name</th>
            <th>Upload a file</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {folders.length == 0 ? (
            <tr>
              <td colSpan="3">No folders available</td>
            </tr>
          ) : (
            folders.map((folder) => (
              <tr key={folder.id}>
                <td onClick={() => handleFolderClick(folder.id)}>
                  {fileUploads && selectedFolderId === folder.id ? (
                    <>
                      {" "}
                      <FaFolderOpen className="me-3 " role="button" />{" "}
                      {folder.folder_name} 
                    </>
                  ) : (
                    <>
                      {" "}
                      <FaFolderClosed className="me-3" role="button" />{" "}
                      {folder.folder_name}
                    </>
                  )}
                </td>
                <td>
                  {selectedFolderId === folder.id && (
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      name="myfile"
                    />
                  )}
                </td>
                <td>
                  <div className="d-flex justify-content-around">
                    <a onClick={() => openDeleteModal(folder.id)}>
                      <MdDelete color="#fea9a9" />
                    </a>
                    <a
                      href={`http://localhost/backendPHP/api.php?action=download_folder&folder_id=${folder.id}&user_id=${user.userId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaDownload color="7C3784"  />
                    </a>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <table>
        <thead>
          <tr>
            <th>File Name</th>
            <th colSpan="2">Action</th>
          </tr>
        </thead>
        <tbody>
          {fileSep.length === 0 ? (
            <tr>
              <td colSpan="4">No files available</td>
            </tr>
          ) : (
            fileSep.map((file) => (

              
              <tr key={file.id}>
                <td>
                   {file.file_name}
                </td>
                <td className="d-flex justify-content-around">
                  <a
                    onClick={() => handleFileDownloadSep(file.file_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaDownload />
                  </a>
                  <a
                    
                   onClick={() => handleFileDeleteSep(file.id)
                   
                   }
                   style={{ cursor: "pointer", color: "#fea9a9" }}
                   >

                    <MdDelete/>           
                  </a>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <hr></hr>
      {selectedFolderId ? (
        <div>
          <h5>Files in Selected Folder : </h5>
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Download</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {files.length == 0 ? (
                <tr>
                  <td colSpan="3">No files available in this folder</td>
                </tr>
              ) : (
                files.map((file) => (
                  <tr key={file.id}>
                    <td> {file.file_name}</td>
                    <td>
                      <FaDownload 
                        onClick={() => handleFileDownload(file.file_path)}
                        style={{ cursor: "pointer", color:"7C3784"}}
                      />
                    </td>
                    <td>
                      <MdDelete 
                        onClick={() => handleFileDelete(file.id)}
                        style={{ cursor: "pointer", color: "#fea9a9" }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        folders.length !== 0 && (
          <div>
            <h5 className="text-danger">
              Please select a folder to view your files!!!
            </h5>
          </div>
        )
      )}

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion!!!!!!</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure, You want to delete this folder?</Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-danger"
            onClick={confirmDeleteFolder}
          >
            Proceed
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Dashboard;
