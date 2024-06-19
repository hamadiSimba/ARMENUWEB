import { STAFF_STATUS } from "../../../lib/enum";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, remove } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMlJX_KBAwnUXyBo-UY88ajSMVrHxTUyI",
  authDomain: "armenu-73998.firebaseapp.com",
  databaseURL: "https://armenu-73998-default-rtdb.firebaseio.com",
  projectId: "armenu-73998",
  storageBucket: "armenu-73998.appspot.com",
  messagingSenderId: "93842579323",
  appId: "1:93842579323:web:2f05c981a858920d9fe7de",
  measurementId: "G-CPKKWB0H7C"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const database = getDatabase(firebase);


// Define the type for staff data from Firebase
export interface FirebaseStaffData {
  id: string;
  username: string;
  email: string;
  mobile: string;
  status: STAFF_STATUS;
  passport: string;
  course: string;
  academicYear: string;
  gender: string;
  address: string;
  birthDate: string;
}

export interface STAFF_DATA_TYPE {
  id: string;
  username: string;
  email: string;
  mobile: string;
  status: STAFF_STATUS;
  passport: string;
  course: string;
  academicYear: string;
  gender: string;
  address: string;
  birthDate: string;
}

export const fetchDataFromFirebase = async (): Promise<STAFF_DATA_TYPE[]> => {
  // const database = getDatabase();
  const firebaseData: STAFF_DATA_TYPE[] = [];
  try {
    const snapshot = await get(ref(database, 'Staff Members'));
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      firebaseData.push({ id: childSnapshot.key, ...data });
    });
    return firebaseData;
  } catch (error) {
    console.error('Error fetching data from Firebase:', error);
    return [];
  }
};

async function mergeData() {
  try {
    const firebaseStaffData = await fetchDataFromFirebase();

    STAFF_DATA.splice(0, STAFF_DATA.length, ...firebaseStaffData);
    
  } catch (error) {
    console.error('Error merging data:', error);
  }
}

// Function to delete staff data from Firebase
export const  deleteStaffFromFirebase = async (staffId: string) => {
  const database = getDatabase();
  const staffRef = ref(database, `Staff Members/${staffId}`);

  try {
    await remove(staffRef);
    console.log(`Staff member ${staffId} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting staff member ${staffId}:`, error);
  }
}


// Define STAFF_DATA as empty array initially
 let STAFF_DATA: STAFF_DATA_TYPE[] = [];

// Call mergeData() to initiate the merging process
mergeData();

// Export the STAFF_DATA array after it's been updated with Firebase data
export { STAFF_DATA };