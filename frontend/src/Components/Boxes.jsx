import '../Style/Boxes.css';
export const Boxes = ({ title, value, description, type }) => (
    <article className={`stat-box stat-box-${type}`}>
        <div className="stat-box-heading">
            <span className="stat-box-indicator" aria-hidden="true" />
            <h3>{title}</h3>
            <span className="stat-box-arrow" aria-hidden="true">↗</span>
        </div>
        <p className="stat-box-value">{value}<span>kg</span></p>
        <span className="stat-box-description">{description}</span>
    </article>
);
