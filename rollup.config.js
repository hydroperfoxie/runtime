export default {
    input: "src/index.ts",
    output: [
        {
            file: "target/iron.js",
            format: "es",
        },
        {
            file: "target/iron.min.js",
            format: "es",
            name: "version",
            plugins: [terser()],
        },
    ],
};