export default function Avatar({ initials, size = 40, className = '' }) {
    return (
        <div
            className={`flex items-center justify-center rounded-full font-sans text-white font-medium shrink-0 ${className}`}
            style={{
                width: size,
                height: size,
                fontSize: size * 0.35,
                background: 'linear-gradient(135deg, #F7F7FB 0%, #6D28D9 100%)',
            }}
        >
            {initials}
        </div>
    )
}
