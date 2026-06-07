import { assets, doctors as localDoctors } from "@/assets/assets";
import { useEffect, useState } from "react";
import { apiGet } from "./api";

export function useDoctors() {
  const [doctors, setDoctors] = useState<any[]>(localDoctors);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const res = await apiGet("/api/doctors");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            // map backend fields to frontend expected fields
            const mapped = data.map((d: any) => ({
              _id: d._id,
              name: d.name || d.fullName || "Doctor",
              speciality: d.speciality || d.specialty || "General physician",
              degree: d.degree || "MBBS",
              experience: d.experience || d.years || "1 Year",
              about: d.bio || d.about || "",
              fees: d.fees || d.fee || 300,
              // backend may provide an `available` flag; default to true when missing
              available: typeof d.available === "boolean" ? d.available : true,
              image: d.profilePicture
                ? { uri: d.profilePicture }
                : assets.doclogo,
            }));
            if (mounted) setDoctors(mapped);
          }
        }
      } catch (err) {
        // keep local doctors on error
        console.warn("Failed to fetch doctors", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDoctors();
    return () => {
      mounted = false;
    };
  }, []);

  return { doctors, loading };
}

export default useDoctors;
