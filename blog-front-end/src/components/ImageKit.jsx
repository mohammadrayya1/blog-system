import { Image, ImageKitProvider } from "@imagekit/react";

const ImageKit = ({ src, className, w, h }) => {
  return (
    <ImageKitProvider urlEndpoint={import.meta.env.VITE_IK_URL_ENDPOINT}>
      <Image
        src={src}
        className={className}
        loading="lazy"
        transformation={[{ active: true, quality: 20 }]}
        width={w}
        height={h}
      />
    </ImageKitProvider>
  );
};

export default ImageKit;
