export default {
    input: "src/index.ts",
    output: [
        {
            file: "target/skyflex.js",
            format: "es",
        },
        {
            file: "target/skyflex.min.js",
            format: "es",
            name: "version",
            plugins: [terser()],
        },
    ],
};