import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function LoadingPosts() {
  // Create an array of 6 items to represent loading skeletons
  const skeletons = Array.from({ length: 6 }, (_, i) => i);
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {skeletons.map((index) => (
        <Card key={index} className="flex flex-col">
          <CardHeader>
            <div className="h-6 w-3/4 bg-muted animate-pulse rounded"></div>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-5/6 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-4/6 bg-muted animate-pulse rounded"></div>
            </div>
          </CardContent>
          <Separator />
          <CardFooter className="pt-4">
            <div className="space-y-2 w-full">
              <div className="h-4 w-1/3 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-1/4 bg-muted animate-pulse rounded"></div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 