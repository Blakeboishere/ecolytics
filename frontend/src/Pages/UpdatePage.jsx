import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export const UpdatePage = () => {
    const { id } = useParams();
    const [entry, setEntry] = useState(null);

    useEffect(() => {
        fetch(`/api/remnants/${id}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch entry");
                }
                return response.json();
            })
            .then((data) => setEntry(data))
            .catch((error) => console.error(error));
    }, [id]);

    if (!entry) {
        return <p>Loading entry...</p>;
    }

    return (
        <div>
            <h2>Update Remnant Entry</h2>

            <form>
                <label>Weight (kg)</label>
                <input
                    type="number"
                    value={entry.weight ?? ""}
                    onChange={(e) =>
                        setEntry({ ...entry, weight: e.target.value })
                    }
                />

                <label>Remnant Type</label>
                <select
                    value={entry.remnantType ?? ""}
                    onChange={(e) =>
                        setEntry({ ...entry, remnantType: e.target.value })
                    }
                >
                    <option value="food">Food</option>
                    <option value="waste">Waste</option>
                </select>

                <label>Item Name</label>
                <input
                    type="text"
                    value={entry.itemName ?? ""}
                    onChange={(e) =>
                        setEntry({ ...entry, itemName: e.target.value })
                    }
                />

                <label>Category</label>
                <input
                    type="text"
                    value={entry.category ?? ""}
                    onChange={(e) =>
                        setEntry({ ...entry, category: e.target.value })
                    }
                />

                {entry.remnantType === "food" && (
                    <>
                        <label>Meal Type</label>
                        <select
                            value={entry.mealType ?? ""}
                            onChange={(e) =>
                                setEntry({ ...entry, mealType: e.target.value })
                            }
                        >
                            <option value="veg">Veg</option>
                            <option value="non-veg">Non-veg</option>
                        </select>
                    </>
                )}
            </form>
        </div>
    );
}
