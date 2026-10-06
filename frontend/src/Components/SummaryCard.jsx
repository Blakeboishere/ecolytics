export const SummaryCard = ({ icon, value, label }) => {
    return (
        <div className="summary-card">

            <div className="summary-icon">
                {icon}
            </div>

            <div>
                <h3>{value}</h3>
                <p>{label}</p>
            </div>

        </div>
    );
};
