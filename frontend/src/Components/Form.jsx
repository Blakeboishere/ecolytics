import { useState } from 'react';

export const Form = () => {
    const [remnantType, setRemnantType] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function submitEntry(event) {
        event.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        const form = event.currentTarget;
        const values = new FormData(form);
        const kind = values.get('waste-type');
        const request = {
            weight: Number(values.get('weight')),
            remnantType: kind,
            itemName: values.get(kind === 'food' ? 'food-name' : 'waste-name'),
            category: values.get(kind === 'food' ? 'food-category' : 'waste-category'),
            mealType: kind === 'food' ? values.get('meal-type') : null,
        };

        try {
            const response = await fetch('/api/remnants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });
            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                if (response.status === 401) {
                    setError('Your session has expired. Log in again, then submit this entry.');
                } else {
                    setError(result.detail || 'The entry could not be saved. Check the details and try again.');
                }
                return;
            }
            form.reset();
            setRemnantType('');
            setSuccess('Remnant entry saved.');
        } catch {
            setError('Could not connect to Ecolytics. Check that the app is running and try again.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <form className="waste-form" onSubmit={submitEntry}>
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
                    min="0.01"
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

            {error && <p className="form-feedback form-feedback-error" role="alert">{error}</p>}
            {success && <p className="form-feedback form-feedback-success" role="status">{success}</p>}

            <button
                type="submit"
                className="new-entry-btn"
                disabled={saving}
            >
                {saving ? 'Saving…' : 'Save entry'}
            </button>

        </form>
    );
};
