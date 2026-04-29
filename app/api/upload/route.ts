import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => {
        // Authenticate the user here if needed
        // const user = await auth();
        // if (!user) throw new Error('Unauthorized');
        
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          tokenPayload: JSON.stringify({
            // optional payload to attach to the token
            // userId: user.id
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('blob upload completed', blob, tokenPayload);
        
        // This is where you would typically save the blob URL to your Neon Database
        // try {
        //   const { userId } = JSON.parse(tokenPayload);
        //   await db.update(users).set({ avatarUrl: blob.url }).where(eq(users.id, userId));
        // } catch (error) {
        //   throw new Error('Could not update user');
        // }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times waiting for a 200
    );
  }
}
