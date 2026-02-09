import Home from "@/components/Home"
import { EmbedGuard } from "./EmbedGuard"

const page = () => {
    return (
        <EmbedGuard>
            <Home />
        </EmbedGuard>
    )
}

export default page