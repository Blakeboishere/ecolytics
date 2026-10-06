export const DetailItem = ({ label, value, className = "" }) => {
    return (
        <div className="detail-item">
            <label>{label}</label>
            <p className={className}>{value}</p>
        </div>
    );
};
