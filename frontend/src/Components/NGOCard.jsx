export const NGOCard = ({
    category,
    name,
    description,
    location
}) => {
    return (
        <div className="ngo-card">

            <div className="ngo-image">
                <div className="ngo-placeholder">
                    NGO
                </div>
            </div>

            <div className="ngo-content">

                <span className="ngo-category">
                    {category}
                </span>

                <h3>{name}</h3>

                <p>{description}</p>

                <div className="ngo-info">
                    <span>📍 {location}</span>
                    <span>✓ Verified</span>
                </div>

                <button className="donate-btn">
                    Donate Now
                </button>

            </div>

        </div>
    );
};
