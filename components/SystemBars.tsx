

// // "auto" is based on current color scheme (light -> dark content, dark -> light content)
// type Style = "auto" | "inverted" | "light" | "dark";

// type SystemBarsProps = {
//   // set the color of the system bar content (as no effect on semi-opaque navigation bar)
//   style?: Style | { statusBar?: Style; navigationBar?: Style };
//   // hide system bars (the navigation bar cannot be hidden on iOS)
//   hidden?: boolean | { statusBar?: boolean; navigationBar?: boolean };
// };

// export const SysBars = () => (
//   <>
//     <SystemBars style="light" />
//     {/* … */}
//   </>
// );