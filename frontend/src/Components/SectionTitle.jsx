export const SectionTitle = ({ className, label, title, description }) => {
    return(
        <>
         <div className={className}>
            <span>{label}</span>
            <h2>{title}</h2>

            {description && <p>{description}</p>}
        </div>
        </>
    )
}