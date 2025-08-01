#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "OnePieceGameMode.generated.h"

/**
 * Game Mode for One Piece Wano Arc Adventure
 * Manages game state, player spawning, and overall game flow
 */
UCLASS()
class ONEPIECEWANOGAME_API AOnePieceGameMode : public AGameModeBase
{
	GENERATED_BODY()

public:
	AOnePieceGameMode();

protected:
	virtual void BeginPlay() override;

	// Current story progression in Wano Arc
	UPROPERTY(BlueprintReadOnly, Category = "Story")
	int32 CurrentStoryChapter;

	// Available characters for this session
	UPROPERTY(BlueprintReadOnly, Category = "Characters")
	TArray<TSubclassOf<class AOnePieceCharacter>> AvailableCharacters;

public:
	// Get current story chapter
	UFUNCTION(BlueprintCallable, Category = "Story")
	int32 GetCurrentStoryChapter() const { return CurrentStoryChapter; }

	// Progress to next story chapter
	UFUNCTION(BlueprintCallable, Category = "Story")
	void ProgressStoryChapter();

	// Check if character is unlocked
	UFUNCTION(BlueprintCallable, Category = "Characters")
	bool IsCharacterUnlocked(TSubclassOf<class AOnePieceCharacter> CharacterClass) const;
};