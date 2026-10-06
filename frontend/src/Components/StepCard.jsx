export const StepCard = ({ number, title, description }) => {
    return(
        <>
          <div className="step-card">
            <div className="step-number">
                {number}
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
        </>
    )
}