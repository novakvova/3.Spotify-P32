import React, { useState } from 'react'
import { getMediaUrl } from '../utils/format'

interface MediaImageProps {
    src?: string | null
    alt?: string
    className?: string
    imgClassName?: string
    fallback: React.ReactNode
    children?: React.ReactNode
}

export default function MediaImage({
    src,
    alt = '',
    className = '',
    imgClassName = 'w-full h-full object-cover block',
    fallback,
    children,
}: MediaImageProps) {
    const resolvedSrc = getMediaUrl(src)
    const [failedSrc, setFailedSrc] = useState<string | null>(null)
    const showImage = Boolean(resolvedSrc && failedSrc !== resolvedSrc)

    return (
        <div className={className}>
            {showImage && resolvedSrc ? (
                <img
                    src={resolvedSrc}
                    alt={alt}
                    loading="lazy"
                    onError={() => setFailedSrc(resolvedSrc)}
                    className={imgClassName}
                />
            ) : (
                fallback
            )}
            {children}
        </div>
    )
}
