"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddressAutoComplete from "@/components/AddressAutoComplete";
import DriverDropdown from "@/components/DriverDropdown";
import VehicleDropdown from "@/components/VehicleDropdown";
import HelperDropdown from "@/components/HelperDropdown";
import { toast } from "sonner";

interface User {
  username: string;
  employee_type: string;
}

interface Vehicle {
  vehicle_id: number;
  plate_number: string;
  vehicle_type: string;
  is_company_owned: boolean;
  subcon_name?: string | null;
}

interface Employee {
  employee_id: number;
  user: User;
}

interface GoogleAddress {
  address: string;
  lat: number;
  lng: number;
}

const CreateNewTripPage = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedHelper, setSelectedHelper] = useState<Employee | null>(null);
  const [selectedHelper2, setSelectedHelper2] = useState<Employee | null>(null);

  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [tripDestinations, setTripDestinations] = useState<GoogleAddress[]>([]);

  const [tripOrigin, setTripOrigin] = useState<GoogleAddress | null>(null);
  const [address, setAddress] = useState<string>("");

  const [busyEmployeeIds, setBusyEmployeeIds] = useState<number[]>([]);
  const [busyVehicleIds, setBusyVehicleIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchBusyAssignments = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_DOMAIN}/ongoing-trips/`);
        const trips = res.data;

        const busyEmployees = new Set<number>();
        const busyVehicles = new Set<number>();

        trips.forEach((trip: any) => {
          busyVehicles.add(trip.vehicle_id);
          busyEmployees.add(trip.employee_id);
          if (trip.helper_id) busyEmployees.add(trip.helper_id);
          if (trip.helper2_id) busyEmployees.add(trip.helper2_id);
        });

        setBusyEmployeeIds(Array.from(busyEmployees));
        setBusyVehicleIds(Array.from(busyVehicles));
      } catch (err) {
        console.error("Failed to fetch ongoing trip data", err);
      }
    };

    fetchBusyAssignments();
  }, []);

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    setTripFormData((prevData) => ({
      ...prevData,
      start_date: date ? date.toISOString() : "", 
    }));
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    setTripFormData((prevData) => ({
      ...prevData,
      end_date: date ? date.toISOString() : "", 
    }));
  };

  interface TripFormData {
    addresses: string[];
    clients: string[];
    distances: string[];
    user_lat: string;
    user_lng: string;
    dest_lat: string[];
    dest_lng: string[]; 
    completed: boolean[];
    multiplier: string;
    driver_base_salary: string;
    helper_base_salary: string;
    additionals: string;
    start_date: string;
    end_date: string;
    origin: string;
    trip_description: string[];
  }

  const [tripFormData, setTripFormData] = useState<TripFormData>({
    addresses: [""],
    clients: [""],
    distances: [""],
    user_lat: "14.65889",  // Keeping default values for user lat/lng
    user_lng: "121.10419",
    dest_lat: [""],
    dest_lng: [""],
    completed: [false],
    multiplier: "",
    driver_base_salary: "",
    helper_base_salary: "",
    additionals: "",
    start_date: startDate ? startDate.toISOString() : "",
    end_date: endDate ? endDate.toISOString() : "",
    origin: "",
    trip_description: [],
  });

  const numOfDrops = tripFormData.addresses.length;

  // Handle multiplier input changes with validation
  const handleMultiplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    //Allow empty string (to clear the field)
    if (value === ""){
      setTripFormData({ ...tripFormData, multiplier: value });
      return;
    }

    // Parse the input as a float
    const numValue = parseFloat(value);

    // Only update state if the value if greater than 0
    if (!isNaN(numValue) && numValue > 0) {
      setTripFormData({ ...tripFormData, multiplier: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedVehicle || !selectedEmployee) {
      toast.error("Please select both a vehicle and an employee.");
      return;
    }

    if (!tripOrigin || !tripFormData.trip_description.length) {
      toast.error("Please provide the trip origin and a description.");
      return;
    }

    if (!tripFormData.multiplier || parseFloat(tripFormData.multiplier) <= 0) {
      toast.error("Please provide a multiplier greater than zero.");
      return;
    }

    if (!tripFormData.driver_base_salary) {
      toast.error("Please provide the driver base salary.");
      return;
    }

    if (!tripFormData.end_date) {
      toast.error("Please provide an end date for the trip.");
      return;
    }

    if (
      (selectedHelper || selectedHelper2) && !tripFormData.helper_base_salary
    ) {
      toast.error("Please provide a base salary for the helper(s).");
      return;
    }

    if (
      tripFormData.helper_base_salary && !selectedHelper && !selectedHelper2
    ) {
      toast.error("Please select helpers if you have provided a base salary for them.");
      return;
    }

    if (selectedHelper && selectedHelper2 && selectedHelper.employee_id === selectedHelper2.employee_id) {
      toast.error("Helper 1 and Helper 2 cannot be the same person.");
      return;
    }

    try {
      const ongoingRes = await axios.get(`${process.env.NEXT_PUBLIC_DOMAIN}/ongoing-trips/`);
      const ongoingTrips = ongoingRes.data;

      const isDriverBusy = ongoingTrips.some(
        (trip: any) => trip.employee_id === selectedEmployee.employee_id
      );

      const isHelperBusy = selectedHelper &&
        ongoingTrips.some((trip: any) => trip.helper_id === selectedHelper.employee_id || trip.helper2_id === selectedHelper.employee_id);

      const isHelper2Busy = selectedHelper2 &&
        ongoingTrips.some((trip: any) => trip.helper_id === selectedHelper2.employee_id || trip.helper2_id === selectedHelper2.employee_id);

      if (isDriverBusy) {
        toast.error("Selected driver is already part of an ongoing trip.");
        return;
      }

      if (isHelperBusy || isHelper2Busy) {
        toast.error("One or both of the selected helpers are already part of an ongoing trip.");
        return;
      }
    } catch (err) {
      console.error("Error checking ongoing trips:", err);
      toast.error("Failed to check ongoing trips. Try again.");
      return;
    }

    const toNullable = (value: string) => (value === "" ? null : value);

    const payload: any = {
      vehicle_id: selectedVehicle.vehicle_id,
      employee_id: selectedEmployee.employee_id,
      helper_id: selectedHelper?.employee_id || null,
      helper2_id: selectedHelper2?.employee_id || null,

      num_of_drops: numOfDrops,
      addresses: [...tripDestinations.map((dest) => dest.address)],
      clients: tripFormData.clients,
      distances: tripFormData.distances,
      user_lat: tripFormData.user_lat,  // Using state values
      user_lng: tripFormData.user_lng,
      dest_lat: [tripDestinations.map((dest) => dest.lat.toString())],
      dest_lng: [tripDestinations.map((dest) => dest.lng.toString())],
      completed: tripFormData.completed,
      origin: tripOrigin,
      trip_description: tripFormData.trip_description,
      multiplier: tripFormData.multiplier
        ? parseFloat(tripFormData.multiplier)
        : null,
      driver_base_salary: tripFormData.driver_base_salary
        ? parseFloat(tripFormData.driver_base_salary)
        : null,
      helper_base_salary: tripFormData.helper_base_salary
        ? parseFloat(tripFormData.helper_base_salary)
        : null,
      additionals: tripFormData.additionals
        ? parseFloat(tripFormData.additionals)
        : null,
      start_date: new Date(tripFormData.start_date).toISOString().split("T")[0],
      end_date: toNullable(tripFormData.end_date)
        ? new Date(tripFormData.end_date).toISOString().split("T")[0]
        : null,       
    };

    try {
      console.log("payload before POST:", payload);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_DOMAIN}/register-trip/`,
        payload
      );
      console.log("API Response:", response);
      toast.success("Trip successfully created!", { duration: 4000 });

      router.push("/dashboard/admin/viewdeliveries");

      setSelectedVehicle(null);     
      setSelectedEmployee(null);
      setSelectedHelper(null);
      setSelectedHelper2(null);
      setTripOrigin(null);
      setTripDestinations([]);
      setEndDate(null);
      setTripFormData({
        addresses: [""],
        clients: [""],
        distances: [""],
        user_lat: "14.65889",  // Default value
        user_lng: "121.10419",  // Default value
        dest_lat: [""],
        dest_lng: [""],
        completed: [false],
        multiplier: "",
        driver_base_salary: "",
        helper_base_salary: "",
        additionals: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        origin: "",
        trip_description: [],
      });
      setTripDestinations([]);
    } catch (error: any) {
      console.error("API Error:", error.response?.data);
      toast.error(error.response?.data?.error || "Failed to create trip.");
    }
  };

  useEffect(() => {
    const delay = setTimeout(async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

        const updatedDestinations = await Promise.all(
          tripDestinations.map(async (dest) => {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                dest.address
              )}&key=${apiKey}`
            );

            const data = await response.json();

            if (!data.results || data.results.length === 0) return dest;

            const { lat, lng } = data.results[0].geometry.location;

            return { ...dest, lat, lng };
          })
        );

        setTripFormData((prev) => ({
          ...prev,
          destinations: updatedDestinations,
        }));
      } catch (err) {
        console.error("Auto-geocoding failed:", err);
      }
    }, 1500);

    return () => clearTimeout(delay);
  }, [tripFormData, tripDestinations]);

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 md:px-8">
      <form
        onSubmit={handleSubmit}
        className="wrapper w-full max-w-4xl mx-auto p-6 rounded-2xl bg-black/20 shadow-lg space-y-6"
      >
        <div className="flex items-center gap-2 mx-3">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-black/60 tracking-[0.2em]">
            Create New Trip
          </h2>
          <Image
            src="/road.png"
            alt="Road Icon"
            width={50}
            height={50}
            className="opacity-60 translate-y-1"
          />
        </div>

        {/* Selection */}
        <div>
          <h3 className="text-lg font-bold mb-2 text-black/70">Selection</h3>
          <div className="space-y-3">
            <VehicleDropdown
              onSelect={({ vehicle }) => setSelectedVehicle(vehicle)}
            />
            <DriverDropdown
              onSelect={({ employee }) => setSelectedEmployee(employee)}
            />
            <HelperDropdown
              onSelect={({ employee }) => setSelectedHelper(employee)}
            />
            <HelperDropdown
              onSelect={({ employee }) => setSelectedHelper2(employee)}
            />           
          </div>
        </div>

        {/* Number of Drops */}
        <h3 className="text-lg font-bold text-black/70">Number of Drops</h3>
        <input
          type="text"
          value={numOfDrops} 
          readOnly
          className="input-field text-black rounded placeholder:text-sm bg-white"
          style={{ marginTop: "2px" }}
          disabled
        />

        {/* Trip Origin */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold text-black/70">Trip Origin</h3>
          <div className="flex">
            <AddressAutoComplete
                onSelect={({ address, lat, lng }) => {
                  console.log("Selected address: ", address);
                  setTripOrigin({address, lat, lng})
                }}
              />
          </div>
        </div>

        {/* Trip Description */}
        <div className="text-black">
          <h3 className="text-lg font-bold text-black/70">Trip Description: </h3>
            <input
              type="text"
              value={tripFormData.trip_description.join(", ")} 
              onChange={(e) => {
                setTripFormData((prevData) => ({
                  ...prevData,
                  trip_description: e.target.value.split(", ").map((desc) => desc.trim()),
                }));
              }}
              placeholder="Frozen, Chilled, Dry, Skin"
              className="input-field text-black rounded "
            />   
        </div>

        {/* Address Array */}
        <div>
          <h3 className="w-full text-lg font-bold text-black/70">Address</h3>
          {tripFormData.addresses.map((address, index) => (
            <div key={index} className="flex gap-2">
              <AddressAutoComplete
                onSelect={({ address, lat, lng }) => {
                  setTripDestinations((prev) => {
                    const newDestinations = [...prev];
                    newDestinations[index] = { address, lat, lng };
                    return newDestinations;
                  });
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const newLat = "14.65889"; // Default value
                  const newLng = "121.10419"; // Default value

                  setTripFormData({
                    ...tripFormData,
                    addresses: [
                      ...tripDestinations.map((dest) => dest.address),
                      "",
                    ],
                    clients: [...tripFormData.clients, ""],
                    user_lat: newLat,
                    user_lng: newLng,
                    dest_lat: [
                      ...tripDestinations.map((dest) => dest.lat.toString()),
                    ],
                    dest_lng: [
                      ...tripDestinations.map((dest) => dest.lng.toString()),
                    ],
                    completed: [...tripFormData.completed, false],
                  });
                }}
                className="text-green-500"
              >
                <Image
                  src="/plustrip2.png"
                  alt="Add Address"
                  width={20}
                  height={20}
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  const newAddresses = tripFormData.addresses.filter((_, i) => i !== index);
                  const newDistances = tripFormData.distances.filter((_, i) => i !== index);
                  const newClients = tripFormData.clients.filter((_, i) => i !== index);
                  const newDestLat = tripFormData.dest_lat.filter((_, i) => i !== index);
                  const newDestLng = tripFormData.dest_lng.filter((_, i) => i !== index);
                  const newCompleted = tripFormData.completed.filter((_, i) => i !== index);

                  setTripFormData({
                    ...tripFormData,
                    addresses: newAddresses,
                    distances: newDistances,
                    clients: newClients,
                    dest_lat: newDestLat,
                    dest_lng: newDestLng,
                    completed: newCompleted,
                  });

                  setTripDestinations((prev) => prev.filter((_, i) => i !== index));
                }}
                className="text-red-500"
                disabled={tripFormData.addresses.length === 1}
              >
                <Image src="/remove.png" alt="Remove" width={20} height={20} />
              </button>
            </div>
          ))}
        </div>

        {/* CLIENTS ARRAY */}
        <div>
          <h3 className="text-lg font-bold text-black/70">Clients</h3>
          {tripFormData.clients.map((client, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                placeholder="Client"
                className="input-field text-black rounded"
                value={client}
                onChange={(e) => {
                  const newClients = [...tripFormData.clients];
                  newClients[index] = e.target.value;
                  setTripFormData({ ...tripFormData, clients: newClients });
                }}
              />
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => {
                  // Remove client at the current index
                  const newClients = tripFormData.clients.filter((_, i) => i !== index);
                  setTripFormData({ ...tripFormData, clients: newClients });
                }}
                className="text-red-500"
                disabled={tripFormData.clients.length === 1} // Disable if there's only one client
              >
                <Image src="/remove.png" alt="Remove" width={20} height={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Multiplier */}
        <h3 className="text-lg font-bold text-black/70">Multiplier</h3>
        <input
          type="number"
          step="0.01"
          min="1.00"
          placeholder="Multiplier (must be greater than 0)"
          className="input-field text-black rounded placeholder:text-sm"
          style={{ marginTop: "4px" }}
          value={tripFormData.multiplier}
          onChange={handleMultiplierChange}
          onKeyDown={(e) => {
            // Prevent entering negative values by blocking the minus key
            if (e.key === '-' || e.key === 'e') {
              e.preventDefault();
            }
          }}
        />

        {/* Driver Base Salary */}
        <h3 className="text-lg font-bold text-black/70">Driver Base Salary</h3>
        <input
          type="number"
          step="0.01"
          min="0.00"
          placeholder="Driver Base Salary (must be greater than 0)"
          className="input-field text-black rounded placeholder:text-sm"
          style={{ marginTop: "4px" }}
          value={tripFormData.driver_base_salary}
          onChange={(e) =>
            setTripFormData({ ...tripFormData, driver_base_salary: e.target.value })
          }
          onKeyDown={(e) => {
          // Prevent entering negative values by blocking the minus and 'e' keys
          if (e.key === '-' || e.key === 'e') {
            e.preventDefault();
          }
        }}
        />

        {/* Helper Base Salary */}
        <h3 className="text-lg font-bold text-black/70">Helper Base Salary</h3>
        <input
          type="number"
          step="0.01"
          min="0.00"
          placeholder="Helper Base Salary (must be greater than 0)"
          className="input-field text-black rounded placeholder:text-sm"
          style={{ marginTop: "4px" }}
          value={tripFormData.helper_base_salary}
          onChange={(e) =>
            setTripFormData({ ...tripFormData, helper_base_salary: e.target.value })
          }
          onKeyDown={(e) => {
          // Prevent entering negative values by blocking the minus and 'e' keys
          if (e.key === '-' || e.key === 'e') {
            e.preventDefault();
          }
        }}
        />

        {/* Additionals */}
        <h3 className="text-lg font-bold text-black/70">Additionals</h3>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Additionals"
          className="input-field text-black rounded placeholder:text-sm"
          style={{ marginTop: "4px" }}
          value={tripFormData.additionals}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            // Check if the value is greater than or equal to 0 before updating state
            if (!isNaN(value) && value >= 0) {
              setTripFormData({ ...tripFormData, additionals: value.toString() });
            }
          }}
        />


        {/* Start Date & End Date */}
        <div className="flex gap-4 mb-4">
          {/* Start Date */}
          <div className="w-1/2">
            <label className="block text-sm text-black mb-1 font-bold">
              Start Date
            </label>
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              dateFormat="MMMM d, yyyy"
              placeholderText="Select start date"
              className="w-full px-4 py-2 rounded-md shadow-md text-black cursor-pointer bg-white"
              calendarClassName="rounded-lg"
            />
          </div>

          {/* End Date */}
          <div className="w-1/2">
            <label className="block text-sm text-black mb-1 font-bold">
              End Date
            </label>
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              dateFormat="MMMM d, yyyy"
              placeholderText="Select end date"
              minDate={startDate || undefined}
              className="w-full px-4 py-2 rounded-md shadow-md text-black cursor-pointer bg-white"
              calendarClassName="rounded-lg"
            />
          </div>
        </div>

        {/* Submit and Back Buttons */}
        <button
          type="submit"
          className="w-full bg-[#668743] text-white py-3 rounded-lg text-lg font-semibold hover:bg-[#345216]"
        >
          Confirm Trip
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/admin/viewdeliveries")}
          className="mb-4 self-start bg-[#668743] hover:bg-[#345216] text-white px-4 py-2 rounded-lg transition"
        >
          ← Back to Deliveries
        </button>
      </form>
    </div>
  );
};

export default CreateNewTripPage;
