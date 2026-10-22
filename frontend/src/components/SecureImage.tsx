import React, { useEffect, useState } from 'react';
import api from '@services/api';

const UPLOADS_PREFIX = '/api/uploads/';

type SecureImageProps = React.ImgHTMLAttributes<HTMLImageElement> & { src: string };

// Igual que <img>, pero las imágenes de /api/uploads se piden con el token de sesión:
// un <img> normal no envía la cabecera Authorization y las imágenes privadas responderían 404.
export const SecureImage: React.FC<SecureImageProps> = ({ src, ...props }) => {
    const isUpload = src.startsWith(UPLOADS_PREFIX);
    const [objectUrl, setObjectUrl] = useState<string>();
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!isUpload) {
            return;
        }

        let url: string | undefined;
        let cancelled = false;
        setFailed(false);
        setObjectUrl(undefined);

        api.getImageBlob(src.slice(UPLOADS_PREFIX.length))
            .then((response) => {
                if (cancelled) {
                    return;
                }
                url = URL.createObjectURL(response.data);
                setObjectUrl(url);
            })
            .catch(() => {
                if (!cancelled) {
                    setFailed(true);
                }
            });

        return () => {
            cancelled = true;
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, [src, isUpload]);

    // Si la descarga falla se usa la URL original, así el onError de quien llama sigue funcionando.
    return <img src={!isUpload || failed ? src : objectUrl} {...props} />;
};
