#pragma once

#include "CoreMinimal.h"
#include "Engine/GameInstance.h"
#include "OnePieceCharacter.h"
#include "OnePieceGameInstance.generated.h"

USTRUCT(BlueprintType)
struct FWanoStoryProgress
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadWrite, Category = "Story")
	int32 CurrentChapter;

	UPROPERTY(BlueprintReadWrite, Category = "Story")
	TArray<FString> CompletedMissions;

	UPROPERTY(BlueprintReadWrite, Category = "Story")
	TArray<FString> UnlockedAreas;

	UPROPERTY(BlueprintReadWrite, Category = "Story")
	TArray<EOnePieceCharacterType> UnlockedCharacters;

	FWanoStoryProgress()
	{
		CurrentChapter = 1;
		CompletedMissions.Empty();
		UnlockedAreas.Empty();
		UnlockedCharacters.Empty();
		
		// Start with Luffy unlocked
		UnlockedCharacters.Add(EOnePieceCharacterType::Luffy);
	}
};

USTRUCT(BlueprintType)
struct FPlayerStats
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadWrite, Category = "Stats")
	int32 TotalPlayTime;

	UPROPERTY(BlueprintReadWrite, Category = "Stats")
	int32 EnemiesDefeated;

	UPROPERTY(BlueprintReadWrite, Category = "Stats")
	int32 MissionsCompleted;

	UPROPERTY(BlueprintReadWrite, Category = "Stats")
	int32 DevilFruitAbilitiesUsed;

	UPROPERTY(BlueprintReadWrite, Category = "Stats")
	int32 HakiActivations;

	FPlayerStats()
	{
		TotalPlayTime = 0;
		EnemiesDefeated = 0;
		MissionsCompleted = 0;
		DevilFruitAbilitiesUsed = 0;
		HakiActivations = 0;
	}
};

/**
 * Game Instance for One Piece Wano Game
 * Manages persistent data, save/load functionality, and global game state
 */
UCLASS()
class ONEPIECEWANOGAME_API UOnePieceGameInstance : public UGameInstance
{
	GENERATED_BODY()

public:
	UOnePieceGameInstance();

protected:
	virtual void Init() override;

	// Persistent game data
	UPROPERTY(BlueprintReadOnly, Category = "Save Data")
	FWanoStoryProgress StoryProgress;

	UPROPERTY(BlueprintReadOnly, Category = "Save Data")
	FPlayerStats PlayerStats;

	UPROPERTY(BlueprintReadOnly, Category = "Save Data")
	EOnePieceCharacterType SelectedCharacter;

	// Game settings
	UPROPERTY(BlueprintReadWrite, Category = "Settings")
	float MasterVolume;

	UPROPERTY(BlueprintReadWrite, Category = "Settings")
	float SFXVolume;

	UPROPERTY(BlueprintReadWrite, Category = "Settings")
	float MusicVolume;

	UPROPERTY(BlueprintReadWrite, Category = "Settings")
	int32 GraphicsQuality;

public:
	// Story progression functions
	UFUNCTION(BlueprintCallable, Category = "Story")
	FWanoStoryProgress GetStoryProgress() const { return StoryProgress; }

	UFUNCTION(BlueprintCallable, Category = "Story")
	void SetStoryProgress(const FWanoStoryProgress& NewProgress);

	UFUNCTION(BlueprintCallable, Category = "Story")
	void CompleteChapter(int32 ChapterNumber);

	UFUNCTION(BlueprintCallable, Category = "Story")
	void UnlockCharacter(EOnePieceCharacterType Character);

	UFUNCTION(BlueprintCallable, Category = "Story")
	void UnlockArea(const FString& AreaName);

	UFUNCTION(BlueprintCallable, Category = "Story")
	bool IsCharacterUnlocked(EOnePieceCharacterType Character) const;

	UFUNCTION(BlueprintCallable, Category = "Story")
	bool IsAreaUnlocked(const FString& AreaName) const;

	// Character selection
	UFUNCTION(BlueprintCallable, Category = "Character")
	void SetSelectedCharacter(EOnePieceCharacterType Character);

	UFUNCTION(BlueprintCallable, Category = "Character")
	EOnePieceCharacterType GetSelectedCharacter() const { return SelectedCharacter; }

	// Stats tracking
	UFUNCTION(BlueprintCallable, Category = "Stats")
	FPlayerStats GetPlayerStats() const { return PlayerStats; }

	UFUNCTION(BlueprintCallable, Category = "Stats")
	void IncrementEnemiesDefeated();

	UFUNCTION(BlueprintCallable, Category = "Stats")
	void IncrementMissionsCompleted();

	UFUNCTION(BlueprintCallable, Category = "Stats")
	void IncrementDevilFruitUsage();

	UFUNCTION(BlueprintCallable, Category = "Stats")
	void IncrementHakiUsage();

	// Save/Load functionality
	UFUNCTION(BlueprintCallable, Category = "Save System")
	void SaveGame();

	UFUNCTION(BlueprintCallable, Category = "Save System")
	void LoadGame();

	UFUNCTION(BlueprintCallable, Category = "Save System")
	bool DoesSaveGameExist() const;

	// Settings
	UFUNCTION(BlueprintCallable, Category = "Settings")
	void SetMasterVolume(float Volume);

	UFUNCTION(BlueprintCallable, Category = "Settings")
	void SetSFXVolume(float Volume);

	UFUNCTION(BlueprintCallable, Category = "Settings")
	void SetMusicVolume(float Volume);

	UFUNCTION(BlueprintCallable, Category = "Settings")
	void SetGraphicsQuality(int32 Quality);

private:
	void InitializeDefaultSettings();
};