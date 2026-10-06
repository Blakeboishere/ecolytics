import { useState } from "react";

export const Form = () => {

    const [remnantType, setRemnantType] = useState("");

    return (
        <form className="waste-form">
            <div className="form-group">
                <label htmlFor="weight">
                    Estimated / Exact Weight (kg)
                </label>

                <input
                    type="number"
                    id="weight"
                    name="weight"
                    placeholder="Enter weight in kg"
                    step="0.01"
                    min="0"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="waste-type">
                    Remnant Type
                </label>

                <select
                    id="waste-type"
                    name="waste-type"
                    value={remnantType}
                    onChange={(e) => setRemnantType(e.target.value)}
                    required
                >
                    <option value="" disabled>
                        Select remnant type
                    </option>

                    <option value="food">
                        Edible Food
                    </option>

                    <option value="waste">
                        Inedible Waste
                    </option>
                </select>
            </div>

            {remnantType === "food" && (
                <>
                    <div className="form-group">
                        <label htmlFor="food-name">
                            Food Name
                        </label>

                        <input
                            type="text"
                            id="food-name"
                            name="food-name"
                            placeholder="Enter food name"
                            required
                        />
                    </div>


                    <div className="form-group">
                        <label htmlFor="meal-type">
                            Meal Type
                        </label>

                        <select
                            id="meal-type"
                            name="meal-type"
                            required
                        >
                            <option value="" disabled>
                                Select meal type
                            </option>

                            <option value="veg">
                                Vegetarian
                            </option>

                            <option value="non-veg">
                                Non-Vegetarian
                            </option>
                        </select>
                    </div>


                    <div className="form-group">
                        <label htmlFor="food-category">
                            Category
                        </label>

                        <select
                            id="food-category"
                            name="food-category"
                            required
                        >
                            <option value="" disabled>
                                Select category
                            </option>

                            <option value="raw">
                                Raw
                            </option>

                            <option value="cooked">
                                Cooked
                            </option>

                            <option value="packed">
                                Packed
                            </option>
                        </select>
                    </div>
                </>
            )}

            {remnantType === "waste" && (
                <>
                    <div className="form-group">
                        <label htmlFor="waste-category">
                            Waste Type
                        </label>

                        <select
                            id="waste-category"
                            name="waste-category"
                            required
                        >
                            <option value="" disabled>
                                Select waste type
                            </option>

                            <option value="biodegradable">
                                Biodegradable
                            </option>

                            <option value="non-biodegradable">
                                Non-Biodegradable
                            </option>
                        </select>
                    </div>


                    <div className="form-group">
                        <label htmlFor="waste-name">
                            Waste Name
                        </label>

                        <input
                            type="text"
                            id="waste-name"
                            name="waste-name"
                            placeholder="Enter waste name"
                            required
                        />
                    </div>
                </>
            )}

            <button
                type="submit"
                className="new-entry-btn"
            >
                Submit
            </button>

        </form>
    );
};