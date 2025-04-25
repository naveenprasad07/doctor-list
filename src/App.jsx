import React, { useState, useEffect } from "react";

const specialtiesList = [
  "General Physician",
  "Dentist",
  "Dermatologist",
  "Paediatrician",
  "Gynaecologist",
  "ENT",
  "Diabetologist",
  "Cardiologist",
  "Physiotherapist",
  "Endocrinologist",
  "Orthopaedic",
  "Ophthalmologist",
  "Gastroenterologist",
  "Pulmonologist",
  "Psychiatrist",
  "Urologist",
  "Dietitian/Nutritionist",
  "Psychologist",
  "Sexologist",
  "Nephrologist",
  "Neurologist",
  "Oncologist",
  "Ayurveda",
  "Homeopath",
];

const App = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [consultMode, setConsultMode] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Fetch doctor data
  useEffect(() => {
    fetch("https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json")
      .then((response) => response.json())
      .then((data) => setDoctors(data))
      .catch((error) => console.error("Error fetching doctors:", error));
  }, []);

  // Handle URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchTerm(params.get("search") || "");
    setConsultMode(params.get("consultMode") || "");
    setSortBy(params.get("sortBy") || "");
    const specialties = params.get("specialties")?.split(",") || [];
    setSelectedSpecialties(specialties.filter((s) => s));

    // Handle browser navigation
    const handlePopState = () => {
      const newParams = new URLSearchParams(window.location.search);
      setSearchTerm(newParams.get("search") || "");
      setConsultMode(newParams.get("consultMode") || "");
      setSortBy(newParams.get("sortBy") || "");
      const newSpecialties = newParams.get("specialties")?.split(",") || [];
      setSelectedSpecialties(newSpecialties.filter((s) => s));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Update URL query params
  const updateQueryParams = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (consultMode) params.set("consultMode", consultMode);
    if (selectedSpecialties.length)
      params.set("specialties", selectedSpecialties.join(","));
    if (sortBy) params.set("sortBy", sortBy);
    window.history.pushState({}, "", `?${params.toString()}`);
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    updateQueryParams();

    // Generate suggestions (top 3 matches)
    if (value) {
      const filtered = doctors
        .filter((doctor) =>
          doctor.name.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 3);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (name) => {
    setSearchTerm(name);
    setSuggestions([]);
    updateQueryParams();
  };

  // Handle filters
  const handleConsultMode = (mode) => {
    setConsultMode(mode);
    updateQueryParams();
  };

  const handleSpecialtyToggle = (specialty) => {
    const updated = selectedSpecialties.includes(specialty)
      ? selectedSpecialties.filter((s) => s !== specialty)
      : [...selectedSpecialties, specialty];
    setSelectedSpecialties(updated);
    updateQueryParams();
  };

  const handleSort = (sortType) => {
    setSortBy(sortType);
    updateQueryParams();
  };

  // Filter and sort doctors
  const filteredDoctors = doctors
    .filter((doctor) => {
      // Search filter
      if (
        searchTerm &&
        !doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Consultation mode filter
      if (consultMode === "Video Consult" && !doctor.video_consult)
        return false;
      if (consultMode === "In Clinic" && !doctor.in_clinic) return false;

      // Specialty filter
      if (selectedSpecialties.length > 0) {
        const doctorSpecialties = doctor.specialities.map((s) => s.name);
        return selectedSpecialties.some((s) => doctorSpecialties.includes(s));
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "fees") {
        return (
          parseInt(a.fees.replace("₹ ", "")) -
          parseInt(b.fees.replace("₹ ", ""))
        );
      }
      if (sortBy === "experience") {
        return parseInt(b.experience) - parseInt(a.experience);
      }
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Autocomplete Search */}
      <div className="mb-6 relative">
        <input
          data-testid="autocomplete-input"
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search doctors by name..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-2 rounded-lg shadow-lg">
            {suggestions.map((doctor) => (
              <li
                key={doctor.id}
                data-testid="suggestion-item"
                onClick={() => handleSuggestionClick(doctor.name)}
                className="p-3 hover:bg-gray-100 cursor-pointer"
              >
                {doctor.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filter Panel */}
        <div className="w-full md:w-1/4">
          {/* Consultation Mode */}
          <div className="mb-6">
            <h3
              data-testid="filter-header-moc"
              className="font-semibold text-lg mb-3"
            >
              Consultation Mode
            </h3>
            <label className="flex items-center mb-2">
              <input
                data-testid="filter-video-consult"
                type="radio"
                name="consultMode"
                checked={consultMode === "Video Consult"}
                onChange={() => handleConsultMode("Video Consult")}
                className="mr-2 h-4 w-4"
              />
              Video Consult
            </label>
            <label className="flex items-center">
              <input
                data-testid="filter-in-clinic"
                type="radio"
                name="consultMode"
                checked={consultMode === "In Clinic"}
                onChange={() => handleConsultMode("In Clinic")}
                className="mr-2 h-4 w-4"
              />
              In Clinic
            </label>
          </div>

          {/* Specialties */}
          <div className="mb-6">
            <h3
              data-testid="filter-header-speciality"
              className="font-semibold text-lg mb-3"
            >
              Speciality
            </h3>
            {specialtiesList.map((specialty) => (
              <label key={specialty} className="flex items-center mb-2">
                <input
                  data-testid={`filter-specialty-${specialty.replace(
                    /\//g,
                    "-"
                  )}`}
                  type="checkbox"
                  checked={selectedSpecialties.includes(specialty)}
                  onChange={() => handleSpecialtyToggle(specialty)}
                  className="mr-2 h-4 w-4"
                />
                {specialty}
              </label>
            ))}
          </div>

          {/* Sort */}
          <div>
            <h3
              data-testid="filter-header-sort"
              className="font-semibold text-lg mb-3"
            >
              Sort
            </h3>
            <label className="flex items-center mb-2">
              <input
                data-testid="sort-fees"
                type="radio"
                name="sort"
                checked={sortBy === "fees"}
                onChange={() => handleSort("fees")}
                className="mr-2 h-4 w-4"
              />
              Fees (Low to High)
            </label>
            <label className="flex items-center">
              <input
                data-testid="sort-experience"
                type="radio"
                name="sort"
                checked={sortBy === "experience"}
                onChange={() => handleSort("experience")}
                className="mr-2 h-4 w-4"
              />
              Experience (High to Low)
            </label>
          </div>
        </div>

        {/* Doctor List */}
        <div className="w-full md:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                data-testid="doctor-card"
                className="border border-gray-200 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <img
                  src={doctor.photo}
                  alt={doctor.name}
                  className="w-24 h-24 rounded-full mb-4 object-cover"
                />
                <h3 data-testid="doctor-name" className="font-bold text-xl">
                  {doctor.name}
                </h3>
                <p
                  data-testid="doctor-specialty"
                  className="text-gray-600 mb-2"
                >
                  {doctor.specialities.map((s) => s.name).join(", ")}
                </p>
                <p data-testid="doctor-experience" className="text-gray-700">
                  {doctor.experience}
                </p>
                <p data-testid="doctor-fee" className="text-gray-700 mb-2">
                  {doctor.fees}
                </p>
                <p className="text-gray-600">
                  {doctor.clinic.name}, {doctor.clinic.address.locality}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
