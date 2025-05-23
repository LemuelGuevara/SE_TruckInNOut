"use client";

import { useState, useEffect, ChangeEvent } from "react";
import usePlacesAutocomplete from "use-places-autocomplete";
import useOnclickOutside from "react-cool-onclickoutside";

interface AddressAutoCompleteProps {
  onSelect: (result: {
    address: string;
    lat: number;
    lng: number;
  }) => void;
  fieldId?: string; // Add an optional ID to differentiate between instances
}

const AddressAutoComplete = ({ onSelect, fieldId = "default" }: AddressAutoCompleteProps) => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  // Check if Google Maps API is loaded
  useEffect(() => {
    const checkGoogleMapsLoaded = () => {
      if (window.google && window.google.maps) {
        setIsGoogleLoaded(true);
      } else {
        setTimeout(checkGoogleMapsLoaded, 100);
      }
    };
    
    checkGoogleMapsLoaded();
  }, []);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    callbackName: `initAddressAutocomplete_${fieldId}`, // Make callback name unique
    requestOptions: {
      componentRestrictions: { country: "ph" }, // PHILIPPINES ONLY
    },
    debounce: 800,
    initOnMount: isGoogleLoaded, // Only initialize when Google is loaded
  });

  const ref = useOnclickOutside(() => {
    clearSuggestions();
  });

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setValue(input);
    
    if (input.length < 10) {
      clearSuggestions();
    }
  };

  const resolveLocation = async ({
    description,
    place_id,
  }: {
    description: string;
    place_id?: string;
  }): Promise<{ address: string; lat: number; lng: number } | null> => {
    if (!isGoogleLoaded) {
      console.error("Google Maps API not loaded");
      return null;
    }
    
    if (place_id) {
      // Use Places API (preferred)
      const service = new google.maps.places.PlacesService(
        document.createElement("div")
      );

      return new Promise((resolve) => {
        service.getDetails(
          {
            placeId: place_id,
            fields: ["geometry", "formatted_address", "name"],
          },
          (place, status) => {
            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              place?.geometry?.location
            ) {
              resolve({
                address: place.formatted_address || description,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              });
            } else {
              console.warn("Places API failed. Falling back to Geocoding.");
              resolve(null); // Try geocoding next
            }
          }
        );
      });
    } else {
      // Fallback: use Geocoding API
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            description
          )}&key=${apiKey}`
        );
        const data = await response.json();
        if (data.status === "OK") {
          const result = data.results[0];
          return {
            address: result.formatted_address,
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
          };
        } else {
          console.error("Geocoding failed:", data.status);
          return null;
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        return null;
      }
    }
  };

  const handleSelect =
    ({ description, place_id }: google.maps.places.AutocompletePrediction) =>
    async () => {
      setValue(description, false);
      clearSuggestions();

      const result = await resolveLocation({ description, place_id });

      if (result) {
        onSelect(result);
      } else {
        alert("Unable to resolve location.");
      }
    };

  const renderSuggestions = () =>
    data.map((suggestion: google.maps.places.AutocompletePrediction) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion;

      return (
        <li
          key={place_id}
          onClick={handleSelect(suggestion)}
          className="cursor-pointer hover:bg-gray-100 p-2"
        >
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </li>
      );
    });

  return (
    <div ref={ref} className="relative text-black">
      <input
        value={value}
        onChange={handleInput}
        disabled={!ready}
        placeholder={ready ? "Enter an address" : "Loading..."}
        className="w-full p-2 border rounded"
      />
      {status === "OK" && value.length >= 10 && (
        <ul className="absolute z-10 w-full bg-white border rounded mt-1">
          {renderSuggestions()}
        </ul>
      )}
    </div>
  );
};

export default AddressAutoComplete;