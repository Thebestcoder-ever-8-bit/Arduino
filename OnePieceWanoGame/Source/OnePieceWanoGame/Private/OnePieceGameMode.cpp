#include "OnePieceGameMode.h"
#include "OnePieceCharacter.h"
#include "Engine/Engine.h"

AOnePieceGameMode::AOnePieceGameMode()
{
	// Set default pawn class
	DefaultPawnClass = AOnePieceCharacter::StaticClass();
	
	// Initialize story progression
	CurrentStoryChapter = 1; // Start with Chapter 1: Arrival at Wano
}

void AOnePieceGameMode::BeginPlay()
{
	Super::BeginPlay();
	
	UE_LOG(LogTemp, Warning, TEXT("One Piece Wano Game Started - Chapter %d"), CurrentStoryChapter);
}

void AOnePieceGameMode::ProgressStoryChapter()
{
	CurrentStoryChapter++;
	
	// Broadcast story progression event
	UE_LOG(LogTemp, Warning, TEXT("Story progressed to Chapter %d"), CurrentStoryChapter);
	
	// Add logic here to unlock new areas, characters, etc.
	switch(CurrentStoryChapter)
	{
		case 2: // Prison Break
			UE_LOG(LogTemp, Warning, TEXT("Unlocked: Udon Prison area"));
			break;
		case 3: // Gathering Allies
			UE_LOG(LogTemp, Warning, TEXT("Unlocked: Flower Capital"));
			break;
		case 4: // Fire Festival
			UE_LOG(LogTemp, Warning, TEXT("Unlocked: Onigashima Island"));
			break;
		default:
			break;
	}
}

bool AOnePieceGameMode::IsCharacterUnlocked(TSubclassOf<AOnePieceCharacter> CharacterClass) const
{
	return AvailableCharacters.Contains(CharacterClass);
}