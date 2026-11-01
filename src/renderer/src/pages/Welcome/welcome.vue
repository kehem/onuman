<template>
    <WelcomeLayout>
        <div class="welcome-container">
            <section class="center-section">
                <h1 class="title animate-bounce-in">CONGRATULATIONS</h1>
                <h2 class="subtitle animate-slide-up">
                    You have successfully completed the installation process
                </h2>
                <button type="button" class="dashboard-button" @click="goToDashboard">
                    <span class="button-text">Go to Dashboard</span>
                    <span class="button-hover-effect"></span>
                </button>
            </section>
            <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>
        </div>
    </WelcomeLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import WelcomeLayout from '../../layouts/WelcomeLayout.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const confettiCanvas = ref<HTMLCanvasElement | null>(null);

const goToDashboard = () => {
    router.push('/dashboard');
};

// Particle interface for type safety
interface ConfettiParticle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
    shape: 'circle' | 'square' | 'star';
}

const createConfetti = () => {
    if (!confettiCanvas.value) return;

    const canvas = confettiCanvas.value;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size and handle resizing
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles: ConfettiParticle[] = [];
    const colors = ['#FFD700', '#FF69B4', '#00FF00', '#1E90FF', '#FF4500'];
    const shapes: ConfettiParticle['shape'][] = ['circle', 'square', 'star'];

    // Create particles
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height, // Start above screen
            size: Math.random() * 10 + 5,
            speedX: (Math.random() - 0.5) * 4,
            speedY: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: shapes[Math.floor(Math.random() * shapes.length)],
        });
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p) => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.size *= 0.98; // Shrink particle

            ctx.fillStyle = p.color;
            ctx.beginPath();

            if (p.shape === 'circle') {
                ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
            } else if (p.shape === 'square') {
                ctx.rect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
            } else if (p.shape === 'star') {
                const points = 5;
                const outerRadius = p.size / 2;
                const innerRadius = outerRadius / 2;
                ctx.moveTo(p.x, p.y - outerRadius);
                for (let i = 0; i < points * 2; i++) {
                    const r = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (Math.PI / points) * i - Math.PI / 2;
                    ctx.lineTo(p.x + r * Math.cos(angle), p.y + r * Math.sin(angle));
                }
                ctx.closePath();
            }

            ctx.fill();

            // Reset particle if off-screen or too small
            if (p.y > canvas.height || p.size < 1) {
                p.x = Math.random() * canvas.width;
                p.y = -p.size;
                p.size = Math.random() * 10 + 5;
                p.speedX = (Math.random() - 0.5) * 4;
                p.speedY = Math.random() * 3 + 2;
            }
        });

        animationId = requestAnimationFrame(animate);
    };

    // Start animation
    animationId = requestAnimationFrame(animate);

    // Cleanup function
    const cleanup = () => {
        window.removeEventListener('resize', resizeCanvas);
        cancelAnimationFrame(animationId);
    };

    return cleanup;
};

onMounted(() => {
    const cleanup = createConfetti();
    onUnmounted(() => {
        if (cleanup) cleanup();
    });
});
</script>

<style scoped>
.welcome-container {
    display: block;
    position: relative;
    overflow: hidden;
    z-index: 4;
}

.center-section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2.5rem;
    height: 100vh;
    position: relative;
    z-index: 10;
}

.title {
    font-size: 3rem;
    font-weight: bold;
    color: #00f159;
}

.subtitle {
    font-size: 1.5rem;
    color: #e9de42;
}

.confetti-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 5;
}

.animate-bounce-in {
    animation: bounce-in 1s ease-out;
}

.animate-slide-up {
    animation: slide-up 0.8s ease-out 0.3s both;
}

@keyframes bounce-in {
    0% {
        transform: scale(0.5);
        opacity: 0;
    }

    60% {
        transform: scale(1.2);
        opacity: 1;
    }

    100% {
        transform: scale(1);
    }
}

@keyframes slide-up {
    0% {
        transform: translateY(50px);
        opacity: 0;
    }

    100% {
        transform: translateY(0);
        opacity: 1;
    }
}
</style>