export function StoreNodeLogo(
  props: React.ImgHTMLAttributes<HTMLImageElement>,
) {
  return (
    <img
      src="/storenode_svg_logo.svg"
      alt="StoreNode"
      className="h-10 w-auto"
      {...props}
    />
  );
}
