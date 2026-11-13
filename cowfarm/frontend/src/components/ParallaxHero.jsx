import { useEffect, useRef } from "react";

// Reemplaza script_servicios.js / script_nosotros.js / la parte de scroll
// de GIC.js: mueve las colinas, el texto y las hojas según el scroll.
export default function ParallaxHero({ title }) {
  const textRef = useRef(null);
  const leafRef = useRef(null);
  const hill1Ref = useRef(null);
  const hill4Ref = useRef(null);
  const hill5Ref = useRef(null);

  useEffect(() => {
    let raf;
    const update = () => {
      const scrollY = window.scrollY;
      if (textRef.current) textRef.current.style.transform = `translateY(${scrollY * 2.5}px)`;
      if (leafRef.current)
        leafRef.current.style.transform = `translate(${scrollY * 1.5}px, ${scrollY * -1.5}px)`;
      if (hill5Ref.current) hill5Ref.current.style.transform = `translateX(${scrollY * 1.5}px)`;
      if (hill4Ref.current) hill4Ref.current.style.transform = `translateX(${scrollY * -1.5}px)`;
      if (hill1Ref.current) hill1Ref.current.style.transform = `translateY(${scrollY * 1}px)`;
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="parallax">
      <img src="/images/imagenes_home/hill1.png" id="hill1" ref={hill1Ref} alt="" />
      <img src="/images/imagenes_home/hill2.png" id="hill2" alt="" />
      <img src="/images/imagenes_home/hill3.png" id="hill3" alt="" />
      <img src="/images/imagenes_home/hill4.png" id="hill4" ref={hill4Ref} alt="" />
      <img src="/images/imagenes_home/hill5.png" id="hill5" ref={hill5Ref} alt="" />
      <img src="/images/imagenes_home/tree.png" id="tree" alt="" />
      <h2 id="text" ref={textRef}>
        {title}
      </h2>
      <img src="/images/imagenes_home/leaf.png" id="leaf" ref={leafRef} alt="" />
      <img src="/images/imagenes_home/plant.png" id="plant" alt="" />
    </section>
  );
}
