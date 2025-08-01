#include "WanoEnemy.h"
#include "OnePieceCharacter.h"
#include "Components/SphereComponent.h"
#include "Components/CapsuleComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "AIController.h"
#include "Engine/Engine.h"
#include "Kismet/GameplayStatics.h"

AWanoEnemy::AWanoEnemy()
{
	PrimaryActorTick.bCanEverTick = true;

	// Set up collision capsule
	GetCapsuleComponent()->SetCapsuleSize(42.f, 96.0f);

	// Create detection sphere
	DetectionSphere = CreateDefaultSubobject<USphereComponent>(TEXT("DetectionSphere"));
	DetectionSphere->SetupAttachment(RootComponent);
	DetectionSphere->SetSphereRadius(500.0f);
	DetectionSphere->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
	DetectionSphere->SetCollisionResponseToAllChannels(ECR_Ignore);
	DetectionSphere->SetCollisionResponseToChannel(ECC_Pawn, ECR_Overlap);

	// Create attack range sphere
	AttackRange = CreateDefaultSubobject<USphereComponent>(TEXT("AttackRange"));
	AttackRange->SetupAttachment(RootComponent);
	AttackRange->SetSphereRadius(150.0f);
	AttackRange->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
	AttackRange->SetCollisionResponseToAllChannels(ECR_Ignore);
	AttackRange->SetCollisionResponseToChannel(ECC_Pawn, ECR_Overlap);

	// Initialize default values
	EnemyType = EWanoEnemyType::BeastPirate;
	EnemyName = TEXT("Beast Pirate");
	
	// Combat stats based on enemy type
	MaxHealth = 200.0f;
	CurrentHealth = MaxHealth;
	AttackPower = 30.0f;
	DefensePower = 10.0f;
	AttackRange = 150.0f;
	AttackCooldown = 2.0f;

	// AI settings
	DetectionRadius = 500.0f;
	PatrolRadius = 300.0f;
	MovementSpeed = 300.0f;
	CurrentState = EEnemyState::Idle;
	TargetPlayer = nullptr;

	// Combat state
	bIsAttacking = false;
	bIsStunned = false;
	LastAttackTime = 0.0f;

	// Set movement speed
	GetCharacterMovement()->MaxWalkSpeed = MovementSpeed;

	// Bind overlap events
	DetectionSphere->OnComponentBeginOverlap.AddDynamic(this, &AWanoEnemy::OnDetectionSphereBeginOverlap);
	DetectionSphere->OnComponentEndOverlap.AddDynamic(this, &AWanoEnemy::OnDetectionSphereEndOverlap);
	AttackRange->OnComponentBeginOverlap.AddDynamic(this, &AWanoEnemy::OnAttackRangeBeginOverlap);
	AttackRange->OnComponentEndOverlap.AddDynamic(this, &AWanoEnemy::OnAttackRangeEndOverlap);
}

void AWanoEnemy::BeginPlay()
{
	Super::BeginPlay();
	
	// Set detection radius
	DetectionSphere->SetSphereRadius(DetectionRadius);
	AttackRange->SetSphereRadius(AttackRange);

	// Initialize stats based on enemy type
	switch (EnemyType)
	{
		case EWanoEnemyType::BeastPirate:
			MaxHealth = 200.0f;
			AttackPower = 30.0f;
			DefensePower = 10.0f;
			break;
		case EWanoEnemyType::Samurai:
			MaxHealth = 300.0f;
			AttackPower = 45.0f;
			DefensePower = 20.0f;
			break;
		case EWanoEnemyType::Gifter:
			MaxHealth = 400.0f;
			AttackPower = 60.0f;
			DefensePower = 25.0f;
			break;
		case EWanoEnemyType::Headliner:
			MaxHealth = 600.0f;
			AttackPower = 80.0f;
			DefensePower = 35.0f;
			break;
		case EWanoEnemyType::AllStar:
			MaxHealth = 1200.0f;
			AttackPower = 120.0f;
			DefensePower = 50.0f;
			break;
		case EWanoEnemyType::Tobi_Roppo:
			MaxHealth = 1000.0f;
			AttackPower = 100.0f;
			DefensePower = 45.0f;
			break;
		case EWanoEnemyType::Kaido:
			MaxHealth = 5000.0f;
			AttackPower = 300.0f;
			DefensePower = 100.0f;
			break;
		default:
			break;
	}

	CurrentHealth = MaxHealth;

	UE_LOG(LogTemp, Warning, TEXT("Enemy %s spawned with %f health"), *EnemyName, CurrentHealth);
}

void AWanoEnemy::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	if (!IsAlive())
		return;

	UpdateAIBehavior();
}

void AWanoEnemy::UpdateAIBehavior()
{
	if (bIsStunned)
		return;

	switch (CurrentState)
	{
		case EEnemyState::Idle:
			// Look for nearby players or patrol
			if (!TargetPlayer)
			{
				SetEnemyState(EEnemyState::Patrolling);
			}
			break;

		case EEnemyState::Patrolling:
			PatrolArea();
			break;

		case EEnemyState::Chasing:
			if (TargetPlayer && IsAlive())
			{
				float DistanceToPlayer = GetDistanceToPlayer();
				if (DistanceToPlayer <= AttackRange && CanAttack())
				{
					SetEnemyState(EEnemyState::Attacking);
				}
				else if (DistanceToPlayer > DetectionRadius * 1.5f)
				{
					// Lost the player
					StopChasing();
				}
			}
			else
			{
				StopChasing();
			}
			break;

		case EEnemyState::Attacking:
			if (TargetPlayer && CanAttack())
			{
				AttackPlayer();
			}
			else
			{
				SetEnemyState(EEnemyState::Chasing);
			}
			break;

		default:
			break;
	}
}

void AWanoEnemy::SetEnemyState(EEnemyState NewState)
{
	if (CurrentState != NewState)
	{
		CurrentState = NewState;
		UE_LOG(LogTemp, Warning, TEXT("Enemy %s state changed to %s"), 
			*EnemyName, *UEnum::GetValueAsString(NewState));
	}
}

void AWanoEnemy::StartChasing(AOnePieceCharacter* Player)
{
	if (Player && IsAlive())
	{
		TargetPlayer = Player;
		SetEnemyState(EEnemyState::Chasing);
		
		// Move towards player using AI controller
		if (AAIController* AIController = Cast<AAIController>(GetController()))
		{
			AIController->MoveToActor(Player);
		}
	}
}

void AWanoEnemy::StopChasing()
{
	TargetPlayer = nullptr;
	SetEnemyState(EEnemyState::Idle);
	
	// Stop movement
	if (AAIController* AIController = Cast<AAIController>(GetController()))
	{
		AIController->StopMovement();
	}
}

void AWanoEnemy::PatrolArea()
{
	// Simple patrol behavior - move to random points within patrol radius
	// In a full implementation, you would use patrol points or navigation mesh
	SetEnemyState(EEnemyState::Idle);
}

void AWanoEnemy::AttackPlayer()
{
	if (!CanAttack() || !TargetPlayer)
		return;

	bIsAttacking = true;
	LastAttackTime = GetWorld()->GetTimeSeconds();

	UE_LOG(LogTemp, Warning, TEXT("Enemy %s attacks %s for %f damage!"), 
		*EnemyName, 
		*UEnum::GetValueAsString(TargetPlayer->GetCharacterType()), 
		AttackPower);

	// Deal damage to player
	TargetPlayer->TakeDamage(AttackPower);

	// Execute enemy-specific attack behavior
	ExecuteEnemyTypeSpecificBehavior();

	// Reset attack state after a delay
	GetWorld()->GetTimerManager().SetTimer(FTimerHandle(), [this]()
	{
		bIsAttacking = false;
		SetEnemyState(EEnemyState::Chasing);
	}, 1.5f, false);
}

void AWanoEnemy::TakeDamage(float DamageAmount)
{
	if (!IsAlive())
		return;

	float FinalDamage = FMath::Max(0.0f, DamageAmount - DefensePower);
	CurrentHealth = FMath::Max(0.0f, CurrentHealth - FinalDamage);

	UE_LOG(LogTemp, Warning, TEXT("Enemy %s takes %f damage! Health: %f/%f"), 
		*EnemyName, FinalDamage, CurrentHealth, MaxHealth);

	if (CurrentHealth <= 0.0f)
	{
		Die();
	}
}

void AWanoEnemy::Die()
{
	SetEnemyState(EEnemyState::Defeated);
	
	UE_LOG(LogTemp, Warning, TEXT("Enemy %s has been defeated!"), *EnemyName);

	// Disable collision and AI
	GetCapsuleComponent()->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	DetectionSphere->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	AttackRange->SetCollisionEnabled(ECollisionEnabled::NoCollision);

	if (AAIController* AIController = Cast<AAIController>(GetController()))
	{
		AIController->StopMovement();
	}

	// Increment player stats
	if (UOnePieceGameInstance* GameInstance = Cast<UOnePieceGameInstance>(UGameplayStatics::GetGameInstance(this)))
	{
		GameInstance->IncrementEnemiesDefeated();
	}

	// Destroy after a delay
	GetWorld()->GetTimerManager().SetTimer(FTimerHandle(), [this]()
	{
		Destroy();
	}, 3.0f, false);
}

void AWanoEnemy::StunEnemy(float StunDuration)
{
	if (!IsAlive())
		return;

	bIsStunned = true;
	SetEnemyState(EEnemyState::Stunned);

	UE_LOG(LogTemp, Warning, TEXT("Enemy %s is stunned for %f seconds!"), *EnemyName, StunDuration);

	// Stop movement
	if (AAIController* AIController = Cast<AAIController>(GetController()))
	{
		AIController->StopMovement();
	}

	// Remove stun after duration
	GetWorld()->GetTimerManager().SetTimer(FTimerHandle(), [this]()
	{
		bIsStunned = false;
		if (TargetPlayer)
		{
			SetEnemyState(EEnemyState::Chasing);
		}
		else
		{
			SetEnemyState(EEnemyState::Idle);
		}
	}, StunDuration, false);
}

void AWanoEnemy::OnDetectionSphereBeginOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	if (AOnePieceCharacter* Player = Cast<AOnePieceCharacter>(OtherActor))
	{
		if (IsAlive() && !bIsStunned)
		{
			StartChasing(Player);
		}
	}
}

void AWanoEnemy::OnDetectionSphereEndOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex)
{
	if (AOnePieceCharacter* Player = Cast<AOnePieceCharacter>(OtherActor))
	{
		if (Player == TargetPlayer)
		{
			// Don't immediately stop chasing, let the AI behavior handle it
		}
	}
}

void AWanoEnemy::OnAttackRangeBeginOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	if (AOnePieceCharacter* Player = Cast<AOnePieceCharacter>(OtherActor))
	{
		if (Player == TargetPlayer && IsAlive() && !bIsStunned)
		{
			SetEnemyState(EEnemyState::Attacking);
		}
	}
}

void AWanoEnemy::OnAttackRangeEndOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex)
{
	if (AOnePieceCharacter* Player = Cast<AOnePieceCharacter>(OtherActor))
	{
		if (Player == TargetPlayer && CurrentState == EEnemyState::Attacking)
		{
			SetEnemyState(EEnemyState::Chasing);
		}
	}
}

bool AWanoEnemy::IsAlive() const
{
	return CurrentHealth > 0.0f && CurrentState != EEnemyState::Defeated;
}

bool AWanoEnemy::CanAttack() const
{
	float CurrentTime = GetWorld()->GetTimeSeconds();
	return IsAlive() && !bIsAttacking && !bIsStunned && 
		   (CurrentTime - LastAttackTime) >= AttackCooldown;
}

float AWanoEnemy::GetDistanceToPlayer() const
{
	if (TargetPlayer)
	{
		return FVector::Dist(GetActorLocation(), TargetPlayer->GetActorLocation());
	}
	return 0.0f;
}

void AWanoEnemy::ExecuteEnemyTypeSpecificBehavior()
{
	switch (EnemyType)
	{
		case EWanoEnemyType::BeastPirate:
			UE_LOG(LogTemp, Warning, TEXT("Beast Pirate uses club attack!"));
			break;
		case EWanoEnemyType::Samurai:
			UE_LOG(LogTemp, Warning, TEXT("Samurai uses sword technique!"));
			break;
		case EWanoEnemyType::Ninja:
			UE_LOG(LogTemp, Warning, TEXT("Ninja uses stealth attack!"));
			break;
		case EWanoEnemyType::Gifter:
			UE_LOG(LogTemp, Warning, TEXT("Gifter uses SMILE Devil Fruit power!"));
			break;
		case EWanoEnemyType::Kaido:
			UE_LOG(LogTemp, Warning, TEXT("Kaido uses Thunder Bagua!"));
			// Kaido could have special area attacks, dragon form, etc.
			break;
		default:
			break;
	}

	UseSpecialAbility();
}