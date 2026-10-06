export const AnalyticsCard = ({
    title,
    subtitle,
    icon,
    heading,
    description,
    children
}) => {
    return (
        <div className="analytics-card">

            <div className="analytics-card-header">

                <div>
                    <h3>{title}</h3>
                    <p>{subtitle}</p>
                </div>

                {children}

            </div>

            <div className="empty-chart">

                <div className="empty-chart-icon">
                    {icon}
                </div>

                <h4>{heading}</h4>

                <p>{description}</p>

            </div>

        </div>
    );
};
