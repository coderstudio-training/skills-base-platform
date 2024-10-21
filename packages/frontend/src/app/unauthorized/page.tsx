import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function UnauthorizedPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-[380px]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        Unauthorized Access
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Sorry, you don't have permission to access this page. Please log in with an authorized account or contact your administrator for assistance.
                    </p>
                </CardContent>
                <CardFooter>
                    <Link href="/" passHref>
                        <Button variant="outline" className="w-full">
                            Return to Home
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
