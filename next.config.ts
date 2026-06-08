import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  outputFileTracingIncludes: {
    "/api/products": ["./src/services/csv.csv"]
  }
};

export default nextConfig;
